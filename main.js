'use strict';

const server = require('./ws.js');
const staticServer = require('./static.js');
const config = require('./config.js');
const path = require('node:path');
const fs = require('node:fs');
const load = require('./load.js');
const Logger = require('./logger/logger.js');
const fsp = fs.promises;

const sandbox = {
  db: require('./db.js'),
  common: { hash: require('./hash.js'), },
  logger: new Logger(fs.createWriteStream('./logs/log')),
};


(async () => {
  const routing = {};
  const apiPath = path.join(process.cwd(), './api');
  const files = await fsp.readdir(apiPath);
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const filepath = path.join(apiPath, file);
    const filename = path.basename(file, '.js');
    routing[filename] = await load(filepath, sandbox);
  }
  staticServer('./static', config.HTTP_PORT);
  server(routing, config.WS_PORT);
})();
