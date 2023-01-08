import path from 'path'
import { build } from 'esbuild'
import colors from 'picocolors'
import { PRE_BUNDLE_DIR } from '../constants'
import { scanPlugin } from './scanPlugin'
import { preBundlePlugin } from './preBundlePlugin'

export async function optimize(root: string) {
  const entry = path.resolve(root, 'src/main.tsx')

  const deps = new Set<string>()
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)],
  })
  console.log(
    `${colors.green('需要预构建的依赖')}:\n${[...deps]
      .map(colors.green)
      .map(item => `  ${item}`)
      .join('\n')}\n`,
  )

  await build({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: 'esm',
    splitting: true,
    outdir: path.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBundlePlugin(deps)],
  })
}
