import path from 'path'
import { init, parse } from 'es-module-lexer'
import type { Loader, Plugin } from 'esbuild'
import resolve from 'resolve'
import fs from 'fs-extra'
import createDebug from 'debug'
import { BARE_IMPORT_RE } from '../constants'
import { normalizePath, slash } from '../utils'

const debug = createDebug('dev')

export function preBundlePlugin(deps: Set<string>): Plugin {
  return {
    name: 'esbuild:pre-bundle',
    setup(build) {
      build.onResolve({
        filter: BARE_IMPORT_RE,
      }, async (resolveInfo) => {
        return {
          path: resolveInfo.path,
          namespace: 'dep',
        }
      })

      build.onLoad({
        filter: /.*/,
        namespace: 'dep',
      },
      async (loadInfo) => {
        await init
        const id = loadInfo.path
        const root = process.cwd()
        const entryPath = slash(resolve.sync(id, { basedir: root }))
        const code = fs.readFileSync(entryPath, 'utf-8')

        const [imports, exports] = parse(code)
        const proxyModule: string[] = []
        const isCJS = !imports.length && !exports.length

        if (isCJS) {
          const res = require(entryPath)
          const specifiers = Object.keys(res)
          proxyModule.push(
            `export { ${specifiers.join(',')} } from '${entryPath}'`,
            `export default require('${entryPath}')`,
          )
        }
        else {
          proxyModule.push(`export * from '${entryPath}'`)
        }

        debug(`pre-bundle: ${id} -> ${entryPath}`)

        return {
          loader: path.extname(entryPath).slice(1) as Loader,
          contents: proxyModule.join('\n'),
          resolveDir: root,
        }
      })
    },
  }
}
