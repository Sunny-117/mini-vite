

async function createPluginContainer({ plugins }) {
  class PluginContext {

  }
  //插件容器是一个用来执行插件的容器
  const container = {
    //resolve是一个方法，是一个根据标记符计算路径的方法
    //vue=>vue在硬盘上对应路径 
    async resolveId(id, importer) {
      let ctx = new PluginContext();
      for (const plugin of plugins) {
        if (!plugin.resolveId) continue;
        const result = await plugin.resolveId.call(ctx, id, importer);
        if (result){
          return result;
        }
      }
      return { id }
    }
  }
  return container;
}
exports.createPluginContainer = createPluginContainer;