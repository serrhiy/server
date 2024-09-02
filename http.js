'use strict';

const http = require('node:http');
const { statuses } = require('./config.js');

const readArgs = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return { data: null, status: statuses.empty };
  try {
    const string = Buffer.concat(chunks).toString();
    return { data: JSON.parse(string), status: statuses.success };
  } catch {
    return { data: null, status: statuses.error };
  }
};

const crud = { get: 'read', post: 'create', put: 'update', delete: 'delete' };

module.exports = (port, routing) => {
  http.createServer(async (request, response) => {
    const { url, method } = request;
    const [entity, ...args] = url.slice(1).split('/');
    const type = crud[method.toLowerCase()];
    const handler = routing[entity]?.[type];
    if (!handler) return void response.end('Not found');
    const { data: jsonArgs, status } = await readArgs(request);
    if (status === statuses.error) return void response.end('Invalid request');
    if (status === statuses.success) args.push(jsonArgs);
    const answer = await handler(...args);
    response.end(JSON.stringify(answer.rows));
  }).listen(port);
};
