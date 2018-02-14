'use strict';

let session = require('../session');

let events = function(io) {

  io.on('connection', function(socket){
    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });
  });
};

let init = function(app) {
  let http = require('http').Server(app);
  let io = require('socket.io')(http);

  io.use(function(socket, next) {
    session(socket.request, socket.request.res, next);
  });

  events (io);

  return http;
};

module.exports = init;
