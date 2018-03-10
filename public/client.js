$(function () {
  let socket = io();

  $('form').submit(function(){
    socket.emit('new message', $('#m').val());
    $('#m').val('');
    return false;
  });

  let displayMessage = function(record) {
    $('#messages').append(
      $('<li>').addClass('chat-message').data('uid', record.user.id).html(
        $('<p />').html([
          $('<span />').addClass('timestamp').text(() => {
            let date = new Date(record.time);
            return date.getHours() + ":" + date.getMinutes();
          })[0],
          $('<span />').addClass('username').css('color', '#' + record.user.colour).text(record.user.name)[0],
        ]).append(record.msg)
      )
    );
  };

  let displaySysMessage = function(msg) {
    $('#messages').append($('<li>').addClass('system-message').text(msg));
  };

  let changeName = function(user) {
    $('#messages li')
      .filter(function() { return $(this).data('uid') === user.id;})
      .find('span.username')
      .text(user.name);
  };

  let changeColour = function(user) {
    $('#messages li')
      .filter(function() { return $(this).data('uid') === user.id;})
      .find('span.username')
      .css('color', '#' + user.colour);
  };

  socket.on('hello', function(info) {
    if ($('#messages li').length === 0) {
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
    changeName(user);
    displaySysMessage('user ' + user.id + ' has changed their name to ' + user.name);
  });

  socket.on('user change colour', function(user) {
    changeColour(user);
    displaySysMessage('user ' + user.name + ' has changed their colour to ' + user.colour);
  });

  socket.on('change name', function(result) {
    if (result.success) { 
      changeName(result.user);
      displaySysMessage('You changed your name to ' + result.user.name);
    }
    else displaySysMessage(result.msg);
  });

  socket.on('change colour', function(result) {
    if (result.success) { 
      changeColour(result.user);
      displaySysMessage('You changed your colour to ' + result.user.colour);
    }
    else displaySysMessage(result.msg);
  });
});
