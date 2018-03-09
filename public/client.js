$(function () {
  var socket = io();
  $('form').submit(function(){
    socket.emit('new message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('new message', function(msg){
    $('#messages').append($('<li>').text(msg));
    window.scrollTo(0, document.body.scrollHeight);
  });
});
