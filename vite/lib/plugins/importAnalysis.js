const { init, parse } = require("es-module-lexer");
const MagicString = require("magic-string");

function importAnalysisPlugin(config) {
    const { root } = config;
    return {
        name: "vite:import-analysis",
        async transform(source, importer) {
            await init;
            let imports = parse(source)[0];
            if (!imports.length) {
                return source;
            }
            let ms = new MagicString(source);
            const normalizeUrl = async (url) => {
                //解析此导入的模块的路径
                const resolved = await this.resolve(url, importer);
                if (resolved.id.startsWith(root + "/")) {
                    //把绝对路径变成相对路径
                    url = resolved.id.slice(root.length);
                }
                return url;
            };
            for (let index = 0; index < imports.length; index++) {
                const { s: start, e: end, n: specifier } = imports[index];
                if (specifier) {
                    const normalizedUrl = await normalizeUrl(specifier);
                    if (normalizedUrl !== specifier) {
                        ms.overwrite(start, end, normalizedUrl);
                    }
                }
            }
            return ms.toString();
        },
    };
}
module.exports = importAnalysisPlugin;