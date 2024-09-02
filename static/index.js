'use strict';

const ws = new WebSocket('ws://127.0.0.1:8001/');

const scaffold = (structure) => {
  const api = {};
  for (const [entity, methods] of Object.entries(structure)) {
    const functions = {};
    for (const method of methods) {
      functions[method] = (...args) => new Promise((resolve) => {
        const packet = { entity, method, args };
        ws.send(JSON.stringify(packet));
        ws.onmessage = (message) => resolve(JSON.parse(message.data));
      });
    }
    api[entity] = functions;
  }
  return api;
};

const structure = {
  user: ['create', 'read', 'update', 'delete'],
};

const api = scaffold(structure);

ws.addEventListener('open', async () => {
  const users = await api.user.read();
  console.log({ users });
});
