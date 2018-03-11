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
      $('<li>').addClass(function() {
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
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
  };

  let displaySysMessage = function($msg, timeout) {
    $('#sysmessages').append($msg);
    $msg.show('fast', () => 
      $("#messages").scrollTop($("#messages")[0].scrollHeight)
    );
    if (timeout) {
      setTimeout(() => {
        $msg.hide('fast', () => 
          $msg.remove()
        );
      }, timeout);
    }
  };

  let displayInfoMessage = function(msg) {
    displaySysMessage($('<li style="display: none;">').text(msg), 20000);
  };

  let displaySuccessMessage = function(msg) {
    displaySysMessage($('<li style="display: none;">').addClass('success').text(msg), 10000);
  };

  let displayWarningMessage = function(msg) {
    displaySysMessage($('<li style="display: none;">').addClass('warn').text(msg), 10000);
  };

  let displayErrorMessage = function(msg, data) {
    // Error messages must be cleared by another function call, not a timeout
    displaySysMessage($('<li style="display: none;">').addClass('error').data('error', data).text(msg), false);
  };

  let userSetOnline = function(user) {
    // If user not currently in Online Users list
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
    // Change name in chat history
    $('#messages li')
      .filter(function() { return $(this).data('uid') === user.id; })
      .find('span.username')
      .text(user.name);
    // Change name in Online Users list 
    $('#users li')
      .filter(function() { return $(this).data('uid') === user.id; })
      .data('uname', user.name)
      .find('span')
      .text(user.name);
  };

  let changeColour = function(user) {
    // Change colour in chat history
    $('#messages li')
      .filter(function() { return $(this).data('uid') === user.id; })
      .find('span.username')
      .css('color', '#' + user.colour);
    // Change colour in Online Users list
    $('#users li')
      .filter(function() { return $(this).data('uid') === user.id; })
      .data('ucolour', user.colour)
      .find('span')
      .css('color', '#' + user.colour);
  };

  socket.on('hello', function(info) {
    me = info.you;

    // If offline message is displayed, remove it and show recconnected message
    let offlineMessages = $('#sysmessages li.error').filter(function() { return $(this).data('error') === 'offline'; });
    if (offlineMessages.length !== 0) {
      offlineMessages.remove();
      displaySuccessMessage('Reconnected');
    }
    else {
      displayInfoMessage('Welcome ' + info.you.name);
      displayInfoMessage('To change your nickname use \'/nick\'. ' +
          'To change your nickname colour use \'/nickcolor\'.');
    }

    // Set name field to left of input text box
    $('#username').text(info.you.name);

    // Clear and rebuild Online User list
    $('#users li').remove();
    userSetOnline(info.you);
    for (let userid of Object.keys(info.users)) {
      userSetOnline(info.users[userid]);
    }

    // Display Any missed Chat History
    for (let record of info.history) {
      if ($('#messages li').filter(function() { return $(this).data('rid') === record.id; }).length === 0)
        displayChatMessage(record);
    }
  });

  socket.on('disconnect', function () {
    displayErrorMessage('You are offline', 'offline');
  });

  socket.on('user join', function(user) {
    userSetOnline(user);
  });

  socket.on('user leave', function(user) {
    userSetOffline(user);
  });

  socket.on('new message', function(record) {
    displayChatMessage(record);
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
      displaySuccessMessage('Nickname changed to ' + result.user.name);
    }
    else displayWarningMessage(result.msg);
  });

  socket.on('change colour', function(result) {
    if (result.success) { 
      changeColour(result.user);
      displaySuccessMessage('Colour changed to ' + result.user.colour);
    }
    else displayWarningMessage(result.msg);
  });
});
