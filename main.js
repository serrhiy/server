'use strict';

const server = require('./ws.js');
const staticServer = require('./static.js');
const config = require('./config.js');
const path = require('node:path');
const fsp = require('node:fs/promises');

const main = async () => {
  const routing = {};
  const apiPath = path.join(process.cwd(), './api');
  const files = await fsp.readdir(apiPath);
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const filepath = path.join(apiPath, file);
    const filename = path.basename(file, '.js');
    routing[filename] = require(filepath);
  }
  staticServer('./static', config.HTTP_PORT);
  server(routing, config.WS_PORT);
};

main();

