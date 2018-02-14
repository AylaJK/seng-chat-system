let express = require('express');
let app = express();

let router = require('./app/router');
let http = require('./app/socket')(app);
let session = require('./app/session');

let port = process.env.PORT || 8080;

app.use('/', router);
app.use(session);

http.listen(port, function(){
  console.log('listening on *:' + port);
});
