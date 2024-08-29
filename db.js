'use strict';

const pg = require('pg');

const pool = new pg.Pool({
  user: 'marcus',
  database: 'example',
  password: 'marcus',
  port: 5432,
  host: '127.0.0.1',
});

module.exports = (table) => ({
  query: async(sql, args) => await pool.query(sql, args),

  create: async ({ ...data }) => {
    const names = Object.keys(data);
    const values = Object.values(data);
    const numbers = new Array(names.length);
    for (let i = 0; i < names.length; i++) numbers[i] = '$' + (i + 1);
    const fields  = names.join(',');
    const indices = numbers.join(',');
    const sql = `INSERT INTO ${table} (${fields}) VALUES (${indices})`;
    return await pool.query(sql, values);
  },

  read: async (id, fields = ['*']) => {
    const names = fields.join(',');
    if (!id) return await pool.query(`SELECT ${names} FROM ${table}`);
    const sql = `SELECT ${names} FROM ${table} WHERE id = $1`;
    return await pool.query(sql, [id]);
  },

  update: async ({ ...data }) => {
    const { id } = data;
    delete data.id;
    const keys = Object.keys(data);
    const values = Object.values(data);
    const { length } = keys;
    const args = new Array(length);
    for (let i = 0; i < length; i++) {
      const arg = keys[i] + '=$' + (i + 1);
      args[i] = arg;
    }
    const delta = args.join(',');
    const sql = `UPDATE ${table} SET ${delta} WHERE id=$${length + 1}`;
    values.push(id);
    return await pool.query(sql, values);
  },

  delete: async ({ ...selectors }) => {
    const args = [];
    const values = [];
    let index = 1;
    for (const key in selectors) {
      values.push(selectors[key]);
      const arg = key + '=$' + index++;
      args.push(arg);
    }
    const sql = `DELETE FROM ${table} WHERE ${args.join(' AND ')}`;
    return await pool.query(sql, values);
  },
});