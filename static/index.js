'use strict';

const ws = new WebSocket('ws://127.0.0.1:8001/');

const scaffold = (strcuture) => {
  const api = {};
  for (const [entity, methods] of Object.entries(strcuture)) {
    const functions = {};
    for (const method of methods) {
      functions[method] = (...args) => new Promise((resolve) => {
        const packet = { entity, name: method, args };
        ws.send(JSON.stringify(packet));
        ws.onmessage = (message) => resolve(JSON.parse(message.data));
      });
    }
    api[entity] = functions;
  }
  return api;
};

const api = scaffold({
  user: ['create', 'read', 'update', 'delete'],
});

ws.addEventListener('open', async () => {
  const user1 = await api.user.read(1);
  const user2 = await api.user.read(2);
  console.log({ user1, user2 });
});