import connect from 'connect'
import colors from 'picocolors'
import { build } from 'esbuild'
import { optimize } from '../optimizer'
import type { Plugin } from '../plugin'
import { resolvePlugins } from '../plugins'
import { transformRequestMiddleware } from './middlewares/transform'
import { createPluginContainer } from './pluginContainer'
import type { PluginContainer } from './pluginContainer'
import { indexHtmlMiddleware } from './middlewares/indexHtml'

export interface ServerContext {
  root: string
  pluginContainer: PluginContainer
  app: connect.Server
  plugins: Plugin[]
}

export async function startServer() {
  const app = connect()
  const root = process.cwd()
  const startTime = Date.now()

  const plugins = resolvePlugins()
  const pluginContainer = createPluginContainer(plugins)

  const serverContext: ServerContext = {
    root: process.cwd(),
    pluginContainer,
    app,
    plugins,
  }

  for (const plugin of plugins) {
    if (plugin.configureServer)
      await plugin.configureServer(serverContext)
  }

  app.use(transformRequestMiddleware(serverContext))

  app.use(indexHtmlMiddleware(serverContext))

  app.listen(3000, async () => {
    await optimize(root)

    console.log(
      colors.green('Vite dev server started:'),
      `cost: ${Date.now() - startTime}ms`,
    )
    console.log(`> 本地访问路径: ${colors.blue('http://localhost:3000')}`)
  })
}
