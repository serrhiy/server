'use strict';

const ws = require('ws');

module.exports = (routing, port) => {
  const server = new ws.Server({ port });
  server.on('connection', (socket, request) => {
    socket.on('message', async (data) => {
      const json = JSON.parse(data);
      const { entity, method, args = [] } = json;
      const handler = routing[entity]?.[method];
      if (!handler) {
        return void socket.send('"Not Found"', { binary: false });
      }
      const response = await handler(...args);
      socket.send(JSON.stringify(response.rows), { binary: false }); 
    });
  });
};
