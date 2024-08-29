'use strict';

const db = require('./db.js');
const server = require('./ws.js');
const staticServer = require('./static.js');

const routing = {
  user: require('./user.js'),
  country: db('country'),
  city: db('city')
}

staticServer('./static', 8000);
server(routing, 8001);
