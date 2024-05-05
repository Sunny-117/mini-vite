const importAnalysisPlugin = require("./importAnalysis");
const preAliasPlugin = require("./preAlias");
const resolvePlugin = require("./resolve");
async function resolvePlugins(config, userPlugins) {
    return [
        preAliasPlugin(config), //把vue=>vue.js
        resolvePlugin(config),
        ...userPlugins,
        importAnalysisPlugin(config),
    ];
}
exports.resolvePlugins = resolvePlugins;