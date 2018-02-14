let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let port = process.env.PORT || 8080;

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/main.css', function(req, res) {
  res.sendFile(path.join(__dirname, 'main.css'));
});

app.get('/client.js', function(req, res) {
  res.sendFile(path.join(__dirname, '/client.js'));
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
