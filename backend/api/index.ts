const serverless = require('serverless-http');
const app = require('../dist/app').default; // compiled Express app
module.exports = serverless(app);