const importAnalysisPlugin = require("./importAnalysis");
const preAliasPlugin = require("./preAlias");
const resolvePlugin = require("./resolve");
async function resolvePlugins(config) {
    return [
        preAliasPlugin(config), //把vue=>vue.js
        resolvePlugin(config),
        importAnalysisPlugin(config),
    ];
}
exports.resolvePlugins = resolvePlugins;