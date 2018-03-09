'use strict';

let cookieParser = require('../cookie');
let session = require('../session');

let events = function(io) {

  io.on('connection', function(socket){
    socket.on('chat message', function(msg){
      let oldmsg = socket.handshake.session.oldmsg;
      socket.handshake.session.oldmsg = msg;
      io.emit('chat message', oldmsg);
    });
  });
};

let init = function(app) {
  let http = require('http').Server(app);
  let io = require('socket.io')(http);

  io.use(require("express-socket.io-session")(session, cookieParser, { autoSave:true }));

  events (io);

  return http;
};

module.exports = init;
