var fs = require('fs');

var parser = function(txt, startLat, intervalLat, startLong, intervalLong, longFlip) {
  // var parsed = {};
  var arrParse = [];

  var lats = txt.split('\n');
  for (var i = 0; i < lats.length; i++) {
    var newLong = startLong;
    lats[i] = lats[i].replace(/\t/g, ' ');
    lats[i] = lats[i].replace(/  +/g, ' ').split(" ");

    if (lats[i][0] === "") lats[i].shift();
    if (lats[i][lats[i].length - 1] === "") lats[i].pop();
    for (var j = 0; j < lats[i].length; j++) {
      if (longFlip === startLong) {
        startLong *= -1;
      }

      // if (!parsed[startLat]) {
      //   parsed[startLat] = {};
      // }

      arrParse.push({lat: startLat, long: startLong, temp: lats[i][j]});

      // parsed[startLat][startLong] = lats[i][j];

      startLong += intervalLong;
    }
    startLat += intervalLat;
  }

  // return parsed;
  return arrParse;

}

var endMessage  = function(files) {
  console.log("Parsed " + files + " file[s]");
}

var saveJSON = function(JSONArray, files) {
  var saved = 0;
  for (var i = 0; i < JSONArray.length; i++) {
    var name = files[i].substring(0, files[i].indexOf('.'));
    fs.writeFile(__dirname + '/data/' + name + ".json", JSON.stringify(JSONArray[i], null, 2), function(err) {
      if (err) {
        console.log(err);
      } 

      saved++;

      if (saved === JSONArray.length) {
        endMessage(JSONArray.length);
      }

    }); 
  }
}

var parsedJSON = [];
var files = [];

fs.readdir(__dirname, function(err ,res){
  for (var i = 0; i < res.length; i++) {

    if (res[i].indexOf('.txt') === res[i].length - 4) {
      files.push(res[i]);
    }

  }

  files.forEach(function(item){
    console.log("Parsing: " + item);
    fs.readFile(item, 'utf8', function (err, res) {
      parsedJSON.push(parser(res, 89.5, -1, .5, 1, 179.5));
      if (parsedJSON.length === files.length){
        saveJSON(parsedJSON, files);
      }
    })
  })

});






