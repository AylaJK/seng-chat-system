$(function () {
  var socket = io();
  $('form').submit(function(){
    socket.emit('new message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('hello', function(info) {
    $('#messages').append($('<li>').text('Hello ' + info.you.name + '!'));
  });

  socket.on('new message', function(record) {
    $('#messages').append($('<li>').text(record.time + ' ' + record.user.name + ': ' + record.msg));
    window.scrollTo(0, document.body.scrollHeight);
  });
});
