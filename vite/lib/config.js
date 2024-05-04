
const { normalizePath } = require('./server/utils');
async function resolveConfig() {
  //当前的根目录 window \\  linux /
  const root = normalizePath(process.cwd());
  const config = {
    root
  }
  return config;
}
module.exports = resolveConfig;