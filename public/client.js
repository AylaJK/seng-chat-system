$(function () {
  let socket = io();

  $('form').submit(function(){
    socket.emit('new message', $('#m').val());
    $('#m').val('');
    return false;
  });

  let displayMessage = function(record) {
    $('#messages').append($('<li>').text(record.time + ' ' + record.user.name + ': ' + record.msg));
  };

  let displaySysMessage = function(msg) {
    $('#messages').append($('<li>').text(msg));
  };

  socket.on('hello', function(info) {
    if ($('#messages').length === 0) {
      for (let record of info.history) {
        displayMessage(record);
      }
    };
    displaySysMessage("Hello " + info.you.name);
  });

  socket.on('user join', function(user) {
    displaySysMessage(user.name + ' has joined');
  });

  socket.on('user leave', function(user) {
    displaySysMessage(user.name + ' has left');
  });

  socket.on('new message', function(record) {
    displayMessage(record);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on('user change name', function(user) {
    displaySysMessage('user ' + user.id + ' has changed their name to ' + user.name);
  });

  socket.on('user change colour', function(user) {
    displaySysMessage('user ' + user.id + ' has changed their colour to ' + user.colour);
  });

  socket.on('change name', function(result) {
    if (result.success) displaySysMessage('You changed your name!');
    else displaySysMessage(result.msg);
  });

  socket.on('change colour', function(result) {
    if (result.success) displaySysMessage('You changed your colour!');
    else displaySysMessage(result.msg);
  });
});
