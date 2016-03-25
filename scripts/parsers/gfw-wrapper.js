// Fetches forma data for each country, using the 
// GFW API. DOES NOT PARSE CSV. I wrote this script
// in the browser, in an earlier commit...

// TODO: Parse CSV. This has been done in ALLDATA.json, as it was saved throught the browser.
// Make this a robust ALLDATA generator...

var request = require('request');
var fs = require('fs');

var allData = {
  algae: {},
  deforestation: {
    countries: {

    }
  }
};

var numForma = 0;
var numCSV = 0;

var parseGeoJSON = function(geojson, name, fullName, key) {
  var arrParse = [];
  for (var i = 0; i < geojson.features.length; i++) {
    arrParse.push({
      latitude: geojson.features[i].geometry.coordinates[1], 
      longitude: geojson.features[i].geometry.coordinates[0], 
      radius: 1, // Perform some sort of regression here.
      fillKey: 'tempbubble',
      borderWidth: 0,
      popupOnHover: true
    });
  }

  allData.deforestation.countries[fullName] = {};
  allData.deforestation.countries[fullName][key] = arrParse;

  numForma++;
  
  if (numForma === 24) {
    console.log("COMPLETED FETCHING");
  }

  fs.writeFile(__dirname + '/parsed-geojson/' + name + ".json", JSON.stringify(arrParse, null, 2), function(err) {
      if (err) {
        console.log(err);
      } else {
      }
  }); 
};

var getFormaData = function(url, name, fullName, key) {
   var options = { method: 'GET',
    url: url};

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    parseGeoJSON(JSON.parse(body), name, fullName, key);
  }); 
};

var getFormaQuery = function(date, location, fullName, key) {
  // 2015-01-01,2015-01-29 sample date

  var options = { method: 'POST',
    url: 'http://api.globalforestwatch.org/forest-change/forma-alerts/admin/' + location,
    formData: { period: date } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body);
    getFormaData(body.download_urls.geojson, location + date, fullName, key);
  });
};


var getQueriesAllCountry = function(countryCode, fullName) {
  getFormaQuery('2015-01-01,2015-01-31', countryCode, fullName, 1);
  getFormaQuery('2015-02-01,2015-02-28', countryCode, fullName, 2);
  getFormaQuery('2015-03-01,2015-03-31', countryCode, fullName, 3);
  getFormaQuery('2015-04-01,2015-04-30', countryCode, fullName, 4);
  getFormaQuery('2015-05-01,2015-05-31', countryCode, fullName, 5);
  getFormaQuery('2015-06-01,2015-06-30', countryCode, fullName, 6);
};

getQueriesAllCountry("mmr", "myanmar");
getQueriesAllCountry("ind", "india");
getQueriesAllCountry("bgd", "bangladesh");
getQueriesAllCountry("tha", "thailand");




