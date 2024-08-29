'use strict';

const db = require('./db.js');
const hash = require('./hash.js');

const user = db('users');

module.exports = {
  ...user,
  
  create: async ({ login, password }) => {
    const hashPassword = await hash(password);
    return await user.create({ login, password: hashPassword });
  },

  read: async (id) => await user.read(id, ['id', 'login']),

  update: async ({ id, login, password }) => {
    const hashPassword = await hash(password);
    return await user.update({ id, login, password: hashPassword });
  },
};