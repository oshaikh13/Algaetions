// A simple server
// Its purpose is to server the client, and give the ALLDAATA json file at the start.

var express = require('express');
var path = require('path');
// Load it in memory
var allData = require('./ALLDATA.json');
var app = express();

app.use(express.static(path.resolve(__dirname + '/client')));

var PORT = process.env.PORT || 8000;

app.get('/data', function(req, res){
  // No need to have repeated fs reads :)
  res.send(allData);
});

app.listen(PORT, function () {
  console.log(PORT);
  console.log('Algaetions server listening!');
});