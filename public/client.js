$(function () {
  let socket = io();
  let me = {};

  $('form').submit(function(){
    let msg = $('#m').val();
    if (!/[^\s]/g.test(msg)) return false; // Must have non-whitespace character
    if (/^\/nick /g.test(msg)) // If setting nickname
      socket.emit('change name', msg.replace(/^\/nick /g, ''));
    else if (/^\/nickcolor /g.test(msg)) // If setting nickname colour
      socket.emit('change colour', msg.replace(/^\/nickcolor /g, ''));
    else
      socket.emit('new message', msg);
    $('#m').val('');
    return false;
  });

  let displayChatMessage = function(record) {
    $('#messages').append(
      $('<li>').addClass('chat-message').addClass(function() {
        if (record.user.id === me.id) return 'my-message';
      }).data('rid', record.id).data('uid', record.user.id).html(
        $('<p />').html([
          $('<span />').addClass('timestamp').text(() => {
            let date = new Date(record.time);
            return date.getHours().toString().padStart(2, "0") + 
              ":" + 
              date.getMinutes().toString().padStart(2, "0");
          })[0],
          $('<span />').addClass('username').css('color', '#' + record.user.colour).text(record.user.name)[0],
        ]).append(record.msg)
      )
    );
  };

  let displaySysMessage = function(msg) {
    $('#messages').append($('<li>').addClass('system-message').text(msg));
  };

  let userSetOnline = function(user) {
    if ($('#users li').filter(function() { return $(this).data('uid') === user.id; }).length === 0)
      $('#users').append(
        $('<li>').data('uid', user.id).data('uname', user.name).data('ucolour', user.colour).html(
          $('<span />').css('color', '#' + user.colour).text(user.name)
        )
      );
  };

  let userSetOffline = function(user) {
    $('#users li').filter(function() { return $(this).data('uid') === user.id; }).remove();
  };

  let changeName = function(user) {
    $('#messages li')
      .filter(function() { return $(this).data('uid') === user.id; })
      .find('span.username')
      .text(user.name);
    $('#users li')
      .filter(function() { return $(this).data('uid') === user.id; })
      .data('uname', user.name)
      .find('span')
      .text(user.name);
  };

  let changeColour = function(user) {
    $('#messages li')
      .filter(function() { return $(this).data('uid') === user.id; })
      .find('span.username')
      .css('color', '#' + user.colour);
    $('#users li')
      .filter(function() { return $(this).data('uid') === user.id; })
      .data('ucolour', user.colour)
      .css('color', '#' + user.colour);
  };

  socket.on('hello', function(info) {
    me = info.you;
    userSetOnline(info.you);
    $('#username').text(info.you.name);
    for (let userid of Object.keys(info.users)) {
      userSetOnline(info.users[userid]);
    }
    for (let record of info.history) {
      if ($('#messages li').filter(function() { return $(this).data('rid') === record.id; }).length === 0)
        displayChatMessage(record);
    }
  });

  socket.on('disconnect', function () {
    userSetOffline(me);
    displaySysMessage('You are offline');
  });

  socket.on('user join', function(user) {
    userSetOnline(user);
  });

  socket.on('user leave', function(user) {
    userSetOffline(user);
  });

  socket.on('new message', function(record) {
    displayChatMessage(record);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on('user change name', function(user) {
    changeName(user);
  });

  socket.on('user change colour', function(user) {
    changeColour(user);
  });

  socket.on('change name', function(result) {
    if (result.success) { 
      changeName(result.user);
      $('#username').text(result.user.name);
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
