'use strict';

const db = require('./db.js');
const http = require('node:http');

const receiveArgs = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const string = Buffer.concat(chunks).toString();
  return JSON.parse(string);
};

const PORT = 8000;

const routing = {
  users: db('users'),
  country: db('country'),
  city: db('city')
}

const crud = { get: 'read', post: 'create', put: 'update', delete: 'delete' };

http.createServer(async (request, response) => {
  const { method, url } = request;
  const [name, ...args] = url.slice(1).split('/');
  const procedure = crud[method.toLowerCase()];
  const handler = routing[name]?.[procedure];
  if (!handler) return void response.end('Not found');
  const source = handler.toString();
  const signature = source.slice(0, source.indexOf(')') + 1);
  if (signature.includes('{')) args.push(await receiveArgs(request));
  const { rows } = await handler(...args);
  response.end(JSON.stringify(rows));
}).listen(PORT);
