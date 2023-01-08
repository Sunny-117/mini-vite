import path from 'path'
import { init, parse } from 'es-module-lexer'
import MagicString from 'magic-string'
import { pathExists } from 'fs-extra'
import resolve from 'resolve'
import {
  BARE_IMPORT_RE,
  DEFAULT_EXTERSIONS,
  PRE_BUNDLE_DIR,
} from '../constants'
import {
  cleanUrl,
  isJSRequest,
  normalizePath, slash,
} from '../utils'
import type { Plugin } from '../plugin'
import type { ServerContext } from '../server/index'

export function importAnalysisPlugin(): Plugin {
  let serverContext: ServerContext
  return {
    name: 'm-vite:import-analysis',
    configureServer(s) {
      serverContext = s
    },
    async transform(code: string, id: string) {
      if (!isJSRequest(id))
        return null

      await init
      const [imports] = parse(code)
      const ms = new MagicString(code)
      for (const importInfo of imports) {
        const { s: modStart, e: modEnd, n: modSource } = importInfo
        if (!modSource)
          continue
        if (BARE_IMPORT_RE.test(modSource)) {
          const bundlePath = normalizePath(
            path.join('/', PRE_BUNDLE_DIR, `${modSource}.js`),
          )
          ms.overwrite(modStart, modEnd, bundlePath)
        }
        else if (modSource.startsWith('.') || modSource.startsWith('/')) {
          const resolved = (await this.resolve?.(modSource, id))
          if (resolved)
            ms.overwrite(modStart, modEnd, resolved.id.replace(slash(serverContext.root), ''))
        }
      }

      return {
        code: ms.toString(),
        // 生成 SourceMap
        map: ms.generateMap(),
      }
    },
  }
}
