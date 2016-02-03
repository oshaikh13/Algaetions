var fs = require('fs');
var readline = require('readline');

var parsedJSON = [];
var files = [];

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var parser = function(txt, startLat, intervalLat, startLong, intervalLong, longFlip) {
  var arrParse = [];

  var lats = txt.split('\n');
  for (var i = 0; i < lats.length; i++) {
    var newLong = startLong;
    lats[i] = lats[i].trim();
    lats[i] = lats[i].replace(/\s{2,}/g,' ');
    lats[i] = lats[i].split(" ");

    if (lats[i][0] === "") lats[i].shift();
    if (lats[i][lats[i].length - 1] === "") lats[i].pop();
    for (var j = 0; j < lats[i].length; j++) {

      arrParse.push({latitude: startLat, longitude: startLong, temp: lats[i][j]});

      if (longFlip === startLong) {
        startLong *= -1;
        continue;
      }

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

rl.question('Enter limits (latlow lathigh longlow longhigh), seperated by a space\n e.g: 70 80 62 65\n:', function(answer) {
  
  var lims;

  if (answer !== "-1") {
    console.log();
    lims = answer.split(" ");

    if (lims.length !== 4){
      console.log("invalid limits");
      process.exit();
    }

    console.log("Parsing with limits:");
    console.log("MinLat: " + lims[0]);
    console.log("MaxLat: " + lims[1]);
    console.log("MinLong: " + lims[2]);
    console.log("MaxLong: " + lims[3]);
    console.log();


  } else {
    lims = null;
  }

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
          if (lims) {
            for (var i = 0; i < parsedJSON.length; i++){
              parsedJSON[i] = parsedJSON[i].filter(function(coordinate){
                var test = ((coordinate.latitude >= lims[0] && coordinate.latitude <= lims[1]) 
                  && (coordinate.longitude >= lims[2] && coordinate.longitude <= lims[3]));

                return test;
              });
            }

          }
          saveJSON(parsedJSON, files);
        }
      })
    })

  });

  rl.close();
});







