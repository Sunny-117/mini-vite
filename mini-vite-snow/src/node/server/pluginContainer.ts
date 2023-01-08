import type {
  LoadResult,
  PartialResolvedId,
  ResolvedId,
  PluginContext as RollupPluginContext,
  SourceDescription,
} from 'rollup'
import type { Plugin } from '../plugin'

export interface PluginContainer {
  resolveId(id: string, importer?: string): Promise<PartialResolvedId | null>

  load(id: string): Promise<LoadResult | null>

  transform(code: string, id: string): Promise<SourceDescription | null>
}

export const createPluginContainer = (plugins: Plugin[]): PluginContainer => {
  class Context implements Partial<RollupPluginContext> {
    async resolve(id: string, importer?: string): Promise<ResolvedId> {
      let out = await pluginContainer.resolveId(id, importer)
      if (typeof out === 'string')
        out = { id: out }

      return out as ResolvedId
    }
  }

  const pluginContainer: PluginContainer = {
    async resolveId(id: string, importer?: string) {
      const ctx = new Context() as any
      for (const plugin of plugins) {
        if (plugin.resolveId) {
          const newId = await plugin.resolveId.call(ctx as any, id, importer)
          if (newId) {
            id = typeof newId === 'string' ? newId : newId.id
            return { id }
          }
        }
      }
      return null
    },
    async load(id) {
      const ctx = new Context() as any
      for (const plugin of plugins) {
        if (plugin.load) {
          const result = await plugin.load.call(ctx, id)
          if (result)
            return result
        }
      }
      return null
    },
    async transform(code, id) {
      const ctx = new Context() as any
      for (const plugin of plugins) {
        if (plugin.transform) {
          const result = await plugin.transform.call(ctx, code, id)
          if (!result)
            continue
          if (typeof result === 'string')
            code = result
          else if (result.code)
            code = result.code
        }
      }
      return { code }
    },
  }

  return pluginContainer
}
