'use strict';

let counter = 1;

let genUser = function() {
  let id = counter;
  let name = 'User' + counter;
  let colour = '000000';
  counter++;
  return { id, name, colour };
};

let aHistory = [];
let addToHistory = function(record) {
  while (aHistory.length >= 200) {
    aHistory.shift(); // pop fist array element
  }
  aHistory.push(record); // push onto end of array
};
let changeHistoricUsername = function (user) {
  for (let record of aHistory) {
    if (record.user.id === user.id) record.user = user;
  }
};

let oUsers = {};
let aOnlineUsers = [];
let userSetOnline = function(user) {
  for (let iOnlineUserId of aOnlineUsers) {
    if (iOnlineUserId === user.id) return;
  }
  aOnlineUsers.push(user.id);
};
let userSetOffline = function(user) {
  let i = aOnlineUsers.indexOf(user.id);
  if (i >= 0) aOnlineUsers.splice(i, 1);
};
let getOnlineUsers = function () {
  let oOnlineUsers = {};
  for (let iOnlineUserId of aOnlineUsers) {
    oOnlineUsers[iOnlineUserId] = oUsers[iOnlineUserId];
  }
  return oOnlineUsers;
};

let init = function(io) {
  io.on('connection', function(socket){
    if (!socket.request.session.user) {
      let oNewUser = genUser();
      oUsers[oNewUser.id] = oNewUser;
      socket.request.session.user = oNewUser;
      socket.request.session.save();
    }
    userSetOnline(socket.request.session.user);
    // Tell client their user info and send history
    socket.emit('hello', { 
      you: socket.request.session.user,
      oUsers: getOnlineUsers(),
      history: aHistory,
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
    socket.on('change name', function(sNewName) {
      sNewName = sNewName.trim(); // remove leading and trailing whitespace
      if (socket.request.session.user.name === sNewName)
        return socket.emit('change name', { success: false, message: 'Cannot change to your current username' });
      if (sNewName === '')
        return socket.emit('change name', { success: false, message: 'Usernames must contain visible characters' });
      if (/^User[0-9]*$/g.test(sNewName))
        return socket.emit('change name', { success: false, message: 'That username is reserved, please pick another one' });
      for (let user of oUsers) {
        if (user.name === sNewName)
          return socket.emit('change name', { success: false, message: 'That username is already taken, please pick another one' });
      }
      oUsers[socket.request.session.user.id].name = sNewName;
      socket.request.session.user.name = sNewName;
      socket.request.session.save();
      changeHistoricUsername(socket.request.session.user);
      socket.broadcast.emit('user change name', { user: socket.request.session.user });
      socket.emit('change name', { success: true });
    });

    // User Changes Colour
    socket.on('change colour', function(sNewColour) {
      sNewColour = sNewColour.toLower().trim;
      if (sNewColour.length !== 6)
        return socket.emit('change colour', { success: false, message: 'Colours must be 6 characters long' });
      if (/[^0-9a-f]/g.test(sNewColour))
        return socket.emit('change colour', { success: false, message: 'Colours can only contain the characters 0-9, A-F, or a-f' });
      oUsers[socket.request.session.user.id].colour = sNewColour;
      socket.request.session.user.colour = sNewColour;
      socket.request.session.save();
      changeHistoricUsername(socket.request.session.user);
      socket.broadcast.emit('user change colour', { user: socket.request.session.user });
      socket.emit('change colour', { success: true });
    });
  });
};

module.exports = init;
