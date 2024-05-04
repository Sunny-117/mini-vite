
const fs = require('fs');
const path = require('path');
const { config } = require('process');
const resolve = require('resolve');

function resolvePlugin({ root }) {
  //是一个vite插件，也是rollup插件
  return {
    name: 'vite:resolve',
    resolveId(id, importer) {//根据你引入名字解析一个硬盘上的路径
      // /
      if (id.startsWith('/')) {// /main.js C:\aproject\vite5\doc\main.js
        return { id: path.resolve(root, id.slice(1)) }
      }
      //绝对路径
      if (path.isAbsolute(id)) {
        return { id }
      }
      //相对路径
      if (id.startsWith('.')) { // ./app.js
        const baseDir = path.dirname(importer);
        const fsPath = path.resolve(baseDir, id);
        return { id: fsPath }
      }
      // vue 第三方模块
      const res = tryNodeResolve(id, importer, { root });
      if (res) return res;
    }
  }
}
function tryNodeResolve(id, importer, { root }) {
  const pkgPath = resolve.sync(`${id}/package.json`, { basedir: config.root });
  const pkgDir = path.dirname(pkgPath)
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const entryPoint = pkg.module;
  const entryPointPath = path.join(pkgDir, entryPoint);
  //C:\aproject\vite5\node_modules\vue\dist\vue.runtime.esm-bundler.js
  //就是vue es module编译 的入口中
  return { id: entryPointPath }
}

module.exports = resolvePlugin;