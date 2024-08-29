'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

module.exports = (root, port) => {
  http.createServer(async (request, response) => {
    const url = request.url === '/' ? 'index.html' : request.url;
    const filename = path.join(root, url);
    const readable = fs.createReadStream(filename);
    readable.pipe(response);
    readable.on('error', () => { 
      response.statusCode = 404;
      response.end('File is not found');
    });
  }).listen(port);
};
