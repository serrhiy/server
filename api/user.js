const user = db('users');

({
  ...user,
  
  create: async ({ login, password }) => {
    const hashPassword = await common.hash(password);
    return await user.create({ login, password: hashPassword });
  },

  read: async (id) => await user.read(id, ['id', 'login']),

  update: async ({ id, login, password }) => {
    const hashPassword = await common.hash(password);
    return await user.update({ id, login, password: hashPassword });
  },
});
