const Koa = require('koa')
const { readFileSync } = require('fs')
const path = require('path')
const app = new Koa()
app.use(async ctx => {
    // /->index.html
    // *.js=>src/*.js
    const { url, query } = ctx.request
    if (url === '/') {
        ctx.type = 'text/html'
        const content = readFileSync("./index.html", 'utf-8')
        ctx.body = content
    } else if (url.endsWith('.js')) {
        // /src/main.js => 代码文件所在位置/src/main.js
        const p = path.resolve(__dirname, url.slice(1))
        const content = readFileSync(p, 'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = content
    }
})
app.listen(9088, () => {
    console.log('Vite start at 9088')
})