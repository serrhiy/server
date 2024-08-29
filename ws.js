'use strict';

const { Server } = require('ws');

module.exports = (routing, port) => {
  const ws = new Server({ port });
  ws.on('connection', (connection) => {
    connection.on('message', async (message) => {
      const json = JSON.parse(message);
      const { entity, name, args = [] } = json;
      const handler = routing[entity]?.[name];
      if (!handler) connection.send('"Not Found"', { binary: false });
      try {
        const answer = await handler(...args);
        connection.send(JSON.stringify(answer.rows), { binary: false });
      } catch {
        connection.send('"Server Error"');
      }
    });
  });
};