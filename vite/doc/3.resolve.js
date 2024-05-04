
const resolve = require('resolve');
let result = require.resolve('vue/package.json');
console.log(result);
let result2 = resolve.sync('vue/package.json');
console.log(result2);