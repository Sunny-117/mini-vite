import { readFileSync } from 'fs'
import path from 'path'
import { pathExists, pathExistsSync } from 'fs-extra'
import type { NextHandleFunction } from 'connect'
import type { ServerContext } from '..'

export function indexHtmlMiddleware(
  serverContext: ServerContext,
): NextHandleFunction {
  return async (req, res, next) => {
    if (req.url === '/') {
      const { root } = serverContext
      const indexHtml = path.resolve(root, 'index.html')
      if (pathExistsSync(indexHtml)) {
        const rawHtml = readFileSync(indexHtml, 'utf-8')
        let html = rawHtml
        for (const plugin of serverContext.plugins) {
          if (plugin.transformIndexHtml)
            html = await plugin.transformIndexHtml(html)
        }

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')

        return res.end(html)
      }
    }

    return next()
  }
}
