const fs = require("fs-extra");

async function transformRequest(url, server) {
    const { pluginContainer } = server;
    const { id } = await pluginContainer.resolveId(url); //获取此文件的绝对路径
    const loadResult = await pluginContainer.load(id); //加载此文件的内容
    console.log(loadResult, '插件的loadResult')
    let code;
    if (loadResult) {
        code = loadResult.code;
    } else {
        code = await fs.readFile(id, "utf-8");
    }
    //转换文件内容
    const transformResult = await pluginContainer.transform(code, id);
    return transformResult;
}
module.exports = transformRequest;