'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');
let rootdir = { root: path.join(__dirname, '../../') };

router.get('/', function(req, res){
  res.sendFile(path.join('public', 'index.html'), rootdir);
});

router.get('/main.css', function(req, res) {
  res.sendFile(path.join('public', 'main.css'), rootdir);
});

router.get('/client.js', function(req, res) {
  res.sendFile(path.join('public', 'client.js'), rootdir);
});

module.exports = router;
