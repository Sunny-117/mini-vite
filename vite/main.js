import { init, parse } from 'es-module-lexer';
// import {createApp} from './bar.js'
// import {createApp} from 'vue'

// function demo() {
//     console.log('demo')
// }
// demo()
// const app = createApp()
// console.log(app)

(async () => {
  await init;
  const [imports, exports] = parse(`import {debounce} from 'lodash';import vue from 'vue';\nexport var p = 5;export const a = 1`);
  console.log(imports);
  console.log(exports);
})();