
const connect = require('connect');
const http = require('http');
const serveStaticMiddleware = require('./middlewares/static');
const resolveConfig = require('../config');
const { createOptimizeDepsRun } = require('../optimizer');

async function createServer() {
  const config = await resolveConfig();
  const middlewares = connect();
  const server = {
    async listen(port) {
      debugger
      await runOptimize(config)
      http.createServer(middlewares).listen(port, async () => {
        console.log(`server running at http://localhost:${port}`);
      });
    }
  }
  middlewares.use(serveStaticMiddleware(config));
  return server;
}
async function runOptimize(config) {
  await createOptimizeDepsRun(config);
}
exports.createServer = createServer;