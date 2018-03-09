'use strict';

let init = function(io) {
  io.on('connection', function(socket){
    socket.on('new message', function(msg){
      let oldmsg = socket.handshake.session.oldmsg;
      socket.handshake.session.oldmsg = msg;
      io.emit('new message', oldmsg);
    });
  });
};

module.exports = init;
