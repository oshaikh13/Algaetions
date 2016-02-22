var bubbles = [];

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
}

var csvParse = function(url, parser, custom, cb) {
  var points = [];
  d3.csv(url, function(err, data) {

    parser(data, points, custom);
    cb(points);
  });

}

$(document).ready(function(argument) {

  var mapElem = document.getElementById('map-view');

  // debugger;
  var setHeight = $(document).height() * .9; //if not null, datamaps will grab the height of 'element'


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
      defaultFill: '#ABDDA4'
    },
    data: {

    },

    done: function(datamap) {
      datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));

      function redraw() {
        datamap.svg.selectAll("g")
          .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")

      }
    }
  });

  var addBubbles = function (data) {
    bubbles = bubbles.concat(data);
    debugger;
    zoom.bubbles(bubbles, {
      popupTemplate: function(geo, bubble) {
        return ['<div class="hoverinfo">' + bubble.radius,
          '<br/>Longitude: ' + bubble.longitude + '',
          '<br/>Latitude: ' + bubble.latitude + '',
          '</div>'
        ].join('');
      }
    });
  }

  var fetchTemp = function (param) {
    $.getJSON('/sst_parser/data/' + param + '.json', function(data){
      addBubbles(data);
    })
  }

  csvParse('/assets/data/phytoplankton/bengalbay/201505.csv',
    parser, {
      fillKey: 'chlorobubble',
      borderWidth: 0,
      popupOnHover: true
    },
    function(data) {
      addBubbles(data);
      fetchTemp('2015-01-04-sst');
    });
})



