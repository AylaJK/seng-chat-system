let express = require('express');
let app = express();

let cookieParser = require('./app/cookie');
let session = require('./app/session');
let router = require('./app/router');
let http = require('./app/socket')(app);

let port = process.env.PORT || 8080;

app.use(cookieParser);
app.use(session);
app.use('/', router);

http.listen(port, function(){
  console.log('listening on *:' + port);
});
