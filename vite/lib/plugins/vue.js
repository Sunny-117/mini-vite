const {
    parse,
    compileScript,
    rewriteDefault,
    compileTemplate,
} = require("vue/compiler-sfc");
const fs = require("fs");

const descriptorCache = new Map();
function vue() {
    return {
        name: "vue",
        async transform(code, id) {
            const { filename } = parseVueRequest(id);
            console.log('vue-hadler: ', { id, filename })
            if (filename.endsWith(".vue")) {
                let result = await transformMain(code, filename);
                return result;
            }
            return null;
        },
    };
}

async function getDescriptor(filename) {
    let descriptor = descriptorCache.get(filename);
    if (descriptor) return descriptor;
    const content = await fs.promises.readFile(filename, "utf8");
    const result = parse(content, { filename });
    descriptor = result.descriptor;
    descriptorCache.set(filename, descriptor);
    return descriptor;
}
async function transformMain(source, filename) {
    const descriptor = await getDescriptor(filename);
    console.log('descriptor-->', descriptor)
    const scriptCode = genScriptCode(descriptor, filename);
    const templateCode = genTemplateCode(descriptor, filename);
    console.log('scriptCode和templateCode', { scriptCode, templateCode })
    let resolvedCode = [
        templateCode,
        scriptCode,
        `_sfc_main['render'] = render`,
        `export default _sfc_main`,
    ].join("\n");
    return { code: resolvedCode };
}

function genScriptCode(descriptor, id) {
    let scriptCode = "";
    let script = compileScript(descriptor, { id });
    if (!script.lang) {
        scriptCode = rewriteDefault(script.content, "_sfc_main");
    }
    return scriptCode;
}
function genTemplateCode(descriptor, id) {
    let content = descriptor.template.content;
    const result = compileTemplate({ source: content, id });
    return result.code;
}
function parseVueRequest(id) {
    const [filename, querystring = ""] = id.split("?");
    let query = new URLSearchParams(querystring);
    return {
        filename,
        query,
    };
}
module.exports = vue;