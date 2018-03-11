'use strict';

let session = require('express-session');

module.exports = session({
  secret: "keyboard cats",
  resave: true, // automatically write to session store
  saveUninitialized: true, // save new sessions
  cookie: {
    path: '/', // base URL path that will trigger client to send cookie
    httpOnly: true, // hide cookie from client-side JavaScript
    secure: false, // send cookie on non-secure connections
    maxAge: 172800000, // two days in milliseconds
  },
});

