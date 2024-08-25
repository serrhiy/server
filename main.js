'use strict';

const pg = require('pg');
const http = require('node:http');
const crypto = require('node:crypto');

const receiveArgs = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const string = Buffer.concat(chunks).toString();
  return JSON.parse(string);
};

const hash = (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(16).toString('base64');
  crypto.scrypt(password, salt, 64, (error, key) => {
    if (error) reject(error);
    else resolve(salt + ':' + key.toString('base64'));
  });
});

const pool = new pg.Pool({
  user: 'marcus',
  database: 'example',
  password: 'marcus',
  port: 5432,
  host: '127.0.0.1',
});

const PORT = 8000;

const routing = {
  users: {
    get: async (id) => {
      if (!id) return await pool.query('SELECT id, login FROM users');
      const sql = 'SELECT id, login FROM users WHERE id = $1';
      return await pool.query(sql, [id]);
    },
    post: async ({ login, password }) => {
      const passwordHash = await hash(password);
      const sql = 'INSERT INTO users (login, password) VALUES ($1, $2)';
      return await pool.query(sql, [login, passwordHash]);
    },
    put: async ({ id, login, password }) => {
      const passwordHash = await hash(password);
      const sql = 'UPDATE users SET login = $1, password = $2 WHERE id = $3';
      return await pool.query(sql, [login, passwordHash, id]);
    },
    delete: async ({ id }) => {
      const sql = 'DELETE FROM users WHERE id = $1';
      return await pool.query(sql, [id]);
    },
  },
};

http.createServer(async (request, response) => {
  const { method, url } = request;
  const [name, ...args] = url.slice(1).split('/');
  const handler = routing[name]?.[method.toLowerCase()];
  if (!handler) return void response.end('Not found');
  const source = handler.toString();
  const signature = source.slice(0, source.indexOf(')') + 1);
  if (signature.includes('{')) args.push(await receiveArgs(request));
  const { rows } = await handler(...args);
  response.end(JSON.stringify(rows));
}).listen(PORT);
