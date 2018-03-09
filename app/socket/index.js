'use strict';

let cookieParser = require('../cookie');
let session = require('../session');

let events = function(io) {
  require('./chat')(io);
};

let init = function(app) {
  let http = require('http').Server(app);
  let io = require('socket.io')(http);

  io.use(require("./express-socket.io-session")(session, cookieParser, { autoSave:true }));

  events (io);

  return http;
};

module.exports = init;
