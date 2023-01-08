import path from 'path'
import { serve } from 'esbuild'
import { pathExists, pathExistsSync } from 'fs-extra'
import resolve from 'resolve'
import { DEFAULT_EXTERSIONS } from '../constants'
import type { Plugin } from '../plugin'
import type { ServerContext } from '../server'
import { cleanUrl, isInternalRequest, normalizePath, removeImportQuery, slash } from '../utils'

export function resolvePlugin(): Plugin {
  let serverContext: ServerContext

  return {
    name: 'm-vite:resolve',
    configureServer(ctx) {
      serverContext = ctx
    },
    async resolveId(id, importer) {
      id = removeImportQuery(cleanUrl(id))
      if (isInternalRequest(id))
        return null

      console.log(id)

      if (path.isAbsolute(id)) {
        if (await pathExists(id))
          return { id }

        id = path.join(serverContext.root, id)
        if (await pathExists(id))
          return { id }
      }
      else if (id.startsWith('.')) {
        if (!importer)
          throw new Error('`importer` should not be undefined')

        const hasExtension = path.extname(id).length > 1
        let resolvedId: string
        if (hasExtension) {
          resolvedId = normalizePath(resolve.sync(id, { basedir: path.dirname(importer) }))
          if (await pathExists(resolvedId))
            return { id: resolvedId }
        }
        else {
          for (const extname of DEFAULT_EXTERSIONS) {
            try {
              const withExtension = `${id}${extname}`
              resolvedId = normalizePath(resolve.sync(withExtension, {
                basedir: path.dirname(importer),
              }))

              if (await pathExists(resolvedId))
                return { id: resolvedId }
            }
            catch (e) {
              continue
            }
          }
        }
      }
      return null
    },
  }
}
