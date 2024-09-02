'use strict';

const db = require('./db.js');
const server = require('./ws.js');
const staticServer = require('./static.js');
const config = require('./config.js');

const routing = {
  user: require('./user.js'),
  country: db('country'),
  city: db('city')
}

staticServer('./static', config.HTTP_PORT);
server(routing, config.WS_PORT);
