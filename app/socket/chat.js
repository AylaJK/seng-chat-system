'use strict';

let counter = 1;

let genUser = function() {
  let id = counter;
  let name = 'User' + counter;
  let colour = '000000';
  counter++;
  return { id, name, colour };
};

let history = [];
let addToHistory = function(record) {
  while (history.length >= 200) {
    history.shift(); // pop fist array element
  }
  history.push(record); // push onto end of array
};
let changeHistoricUsername = function (user) {
  for (let record of history) {
    if (record.user.id === user.id) record.user = user;
  }
};

let users = {};
let onlineUsers = [];
let userSetOnline = function(user) {
  for (let onlineUser of onlineUsers) {
    if (onlineUser === user.id) return;
  }
  onlineUsers.push(user.id);
};
let userSetOffline = function(user) {
  let i = onlineUsers.indexOf(user.id);
  if (i >= 0) onlineUsers.splice(i, 1);
};
let getOnlineUsers = function () {
  let usersOnline = {};
  for (let onlineUser of onlineUsers) {
    usersOnline[onlineUser] = users[onlineUser];
  }
  return usersOnline;
};

let init = function(io) {
  io.on('connection', function(socket){
    if (!socket.request.session.user) {
      let newuser = genUser();
      users[newuser.id] = newuser;
      socket.request.session.user = newuser;
      socket.request.session.save();
    }
    userSetOnline(socket.request.session.user);
    // Tell client their user info and send history
    socket.emit('hello', { 
      you: socket.request.session.user,
      users: getOnlineUsers(),
      history: history,
    });
    // Then tell everyone else who the new person is
    socket.broadcast.emit('user join', { user: socket.request.session.user });

    // When User Leaves
    socket.on('disconnect', function () {
      userSetOffline(socket.request.session.user);
      socket.broadcast.emit('user leave', { user: socket.request.session.user });
    });

    // User Sends Message
    socket.on('new message', function(msg){
      let record = { 
        user: socket.request.session.user, 
        time: Date.now(),
        msg: msg,
      };
      addToHistory(record);
      io.emit('new message', record);
    });

    // User Changes Name
    socket.on('change name', function(newname) {
      newname = newname.trim(); // remove leading and trailing whitespace
      if (socket.request.session.user.name === newname)
        return socket.emit('change name', { success: false, message: 'Cannot change to your current username' });
      if (newname === '')
        return socket.emit('change name', { success: false, message: 'Usernames must contain visible characters' });
      if (/^User[0-9]*$/g.test(newname))
        return socket.emit('change name', { success: false, message: 'That username is reserved, please pick another one' });
      for (let user of users) {
        if (user.name === newname)
          return socket.emit('change name', { success: false, message: 'That username is already taken, please pick another one' });
      }
      users[socket.request.session.user.id].name = newname;
      socket.request.session.user.name = newname;
      socket.request.session.save();
      changeHistoricUsername(socket.request.session.user);
      socket.broadcast.emit('user change name', { user: socket.request.session.user });
      socket.emit('change name', { success: true });
    });

    // User Changes Colour
    socket.on('change colour', function(newcolour) {
      newcolour = newcolour.toLower();
      if (newcolour.length !== 6)
        return socket.emit('change colour', { success: false, message: 'Colours must be 6 characters long' });
      if (/[^0-9a-f]/g.test(newcolour))
        return socket.emit('change colour', { success: false, message: 'Colours can only contain the characters 0-9, A-F, or a-f' });
      users[socket.request.session.user.id].colour = newcolour;
      socket.request.session.user.colour = newcolour;
      socket.request.session.save();
      changeHistoricUsername(socket.request.session.user);
      socket.broadcast.emit('user change colour', { user: socket.request.session.user });
      socket.emit('change colour', { success: true });
    });
  });
};

module.exports = init;
