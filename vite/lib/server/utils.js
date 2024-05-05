const knownJsSrcRE = /\.js/
const isJSRequest = (url) => {
  if (knownJsSrcRE.test(url)) {
    return true
  }
  return false
}

function normalizePath(path) {
  return path.replace(/\\/g, '/');
}
exports.normalizePath = normalizePath;
exports.isJSRequest = isJSRequest;