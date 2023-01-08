import { readFileSync } from 'fs'
import path from 'path'
import type { NextHandleFunction } from 'connect'
import { pathExists, pathExistsSync } from 'fs-extra'
import type { ServerContext } from '..'
import { cleanUrl, isJSRequest } from '../../utils'

export async function transformRequest(
  url: string,
  ctx: ServerContext,
) {
  const { pluginContainer } = ctx
  url = cleanUrl(url)

  const resolvedResult = await pluginContainer.resolveId(url)
  let transformResult

  if (resolvedResult?.id) {
    let code = await pluginContainer.load(resolvedResult.id)
    if (typeof code === 'object' && code !== null)
      code = code.code

    if (code)
      transformResult = await pluginContainer.transform(code, resolvedResult.id)
  }

  return transformResult
}

export function transformRequestMiddleware(
  serverContext: ServerContext,
): NextHandleFunction {
  return async (req, res, next) => {
    if (req.method !== 'GET' && !req.url)
      return next()

    const url = req.url as string

    if (isJSRequest(url)) {
      let result = await transformRequest(url, serverContext) as any
      if (!result)
        return next()

      if (result && typeof result !== 'string')
        result = result.code

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/javascript')
      return res.end(result)
    }

    return next()
  }
}

