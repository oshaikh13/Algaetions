var localStorageData = localStorage.getItem('data');

var parser = function(data, points, custom) {
  data.forEach(function(coordinates) {
    var data = {};
    for (var key in coordinates) {
      if (key === "") { // latitude
        data.latitude = coordinates[key];
      } else if (coordinates[key] !== "NaN") { // longitude
        data.longitude = key;
        data.radius = coordinates[key];
      }
    }

    if (data.latitude && data.radius && data.longitude) {
      for (var key in custom) {
        data[key] = custom[key];
      }
      points.push(data);
    }

  });
};

var csvParse = function(url, parser, custom, key, cb) {
  var points = [];
  d3.csv(url, function(err, data) {

    parser(data, points, custom);
    cb(points, key);
  });

};


var data = {
  algae : {},
  deforestation: {
    countries : {

    }
  }
};


var bubbles = [];
var addBubbles;

var loadedDeforestation = 0;
var loadedCSV = 0;

var storeLocal = function() {
  localStorage.setItem('data', JSON.stringify(data));
  console.log('STORED');
};

var fetchDeforestation = function(param, month, country) {
  $.getJSON('/sst_parser/parsed-geojson/' + param + '.json', function(forestBubble){
    if (!data.deforestation.countries[country]) {
      data.deforestation.countries[country] = {};
    }

    data.deforestation.countries[country][month] = forestBubble;
    loadedDeforestation++;

    if (loadedCSV === 6 && loadedDeforestation === 24) {
      storeLocal();
    } 

  });
};


var initDeforestationFetch = function(countryCode, countryName) {
  fetchDeforestation(countryCode +'2015-01-01,2015-01-31', 1, countryName);
  fetchDeforestation(countryCode +'2015-02-01,2015-02-28', 2, countryName);
  fetchDeforestation(countryCode +'2015-03-01,2015-03-31', 3, countryName);
  fetchDeforestation(countryCode +'2015-04-01,2015-04-30', 4, countryName);
  fetchDeforestation(countryCode +'2015-05-01,2015-05-31', 5, countryName);
  fetchDeforestation(countryCode +'2015-06-01,2015-06-30', 6, countryName);
};


var initFetch = function() {
  initDeforestationFetch('mmr', 'myanmar');
  initDeforestationFetch('ind', 'india');
  initDeforestationFetch('bgd', 'bangladesh');
  initDeforestationFetch('tha', 'thailand');



  for (var i = 1; i <= 6; i++) {
    csvParse('/assets/data/phytoplankton/bengalbay/20150' + i +'.csv',
      parser, {
        fillKey: 'chlorobubble',
        borderWidth: 0,
        popupOnHover: true
      },

      i,

      function (blooms, key) { 
        loadedCSV++;
        if (loadedCSV === 6 && loadedDeforestation === 24) {
          storeLocal();
        } 
        data.algae[key] = blooms;
      }
    );  
  }
};


if (!localStorageData) {
  console.log("NOT STORED. FETCHING");
  initFetch();
} else {
  console.log("STORED. YAY");
  data = localStorageData;
}


var checkMapForm = function() {
  console.log('Updating map');
  var algaeDate = $('input[name=2015-algae]:checked', '#mapform').val();
  var deforestationDate = $('input[name=2015-forest]:checked', '#mapform').val();
  var country = $('input[name=countries]:checked', '#mapform').val();
  var cumulative = $('#cumulative').prop('checked');


  console.log(algaeDate);
  console.log(deforestationDate);
  console.log(country);
  console.log(cumulative);

};


$(document).ready(function(argument) {

  var mapElem = document.getElementById('map-view');

  // debugger;
  var setHeight = $(document).height() * 0.9; //if not null, datamaps will grab the height of 'element'


  var zoom = new Datamap({
    element: mapElem,
    scope: 'world',
    height: setHeight,
    // Zoom in on Bengal Bay
    setProjection: function(element) {
      var projection = d3.geo.equirectangular()
        .center([92.0000, 15.0000]) // long, lat
        .rotate([4.4, 0])
        .scale(1000)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
      var path = d3.geo.path()
        .projection(projection);

      return {
        path: path,
        projection: projection
      };
    },
    fills: {
      chlorobubble: "#009933",
      defaultFill: '#ABDDA4',
      tempbubble: '#ff0000'
    },
    data: {

    },

    done: function(datamap) {
      datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));

      function redraw() {
        datamap.svg.selectAll("g")
          .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

      }
    }
  });

  addBubbles = function (data) {
    bubbles = bubbles.concat(data);
    zoom.bubbles(bubbles, {
      popupTemplate: function(geo, bubble) {
        if (!bubble.temp) {
          bubble.temp = bubble.radius;
        }
        return ['<div class="hoverinfo">' + bubble.temp,
          '<br/>Longitude: ' + bubble.longitude + '',
          '<br/>Latitude: ' + bubble.latitude + '',
          '</div>'
        ].join('');
      }
    });
  };

  var fetchTemp = function (param) {
    $.getJSON('/sst_parser/data/' + param + '.json', function(data){
      addBubbles(data);
    });
  };

});





