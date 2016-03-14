var express = require('express');
var path = require('path');
var allData = require('./ALLDATA.json');
var app = express();

app.use(express.static(path.resolve(__dirname + '/./client')));

var PORT = process.env.PORT || 8000;

app.get('/data', function(req, res){
  res.send(allData);
});

app.listen(PORT, function () {
  console.log(PORT);
  console.log('Example app listening!');
});