'use strict';

let session = require('express-session');

let init = function() {
  
  return session({
    secret: "keyboard cats",
    resave: true,
    saveUninitialized: true
  });
};

module.exports = init();
