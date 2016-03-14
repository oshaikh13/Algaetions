var localStorageData = localStorage.getItem('data');

// Data "schema"
var data = {
  algae : {},
  deforestation: {
    countries : {

    }
  }
};

var autoSwitch = true;

var bubbles = [];
var addBubbles;

var loadedDeforestation = 0;
var loadedCSV = 0;

var storeLocal = function() {
  localStorage.setItem('data', JSON.stringify(data));
  console.log('STORED');
};




var loadBubbles = function(algaeDate, deforestationDate, cumulative, country) {
  bubbles = [];
  algaeDate = parseInt(algaeDate);
  deforestationDate = parseInt(deforestationDate);

  console.log(algaeDate, deforestationDate, cumulative, country);

  if (country === "all") {
    for (var key in data.deforestation.countries) {
      var set = data.deforestation.countries[key];
      if (cumulative) {
        for (var i = deforestationDate; i >=1; i--) {
          bubbles = bubbles.concat(set[i]);
        }
      } else {
        bubbles = bubbles.concat(set[deforestationDate]);  
      }
    }
  } else {
    var countryData = data.deforestation.countries[country];

    if (cumulative) {
      for (var i = deforestationDate; i >=1; i--) {
        bubbles = bubbles.concat(countryData[i]);
      }
    } else {
      bubbles = bubbles.concat(countryData[deforestationDate]);  
    }
  }

  bubbles = bubbles.concat(data.algae[algaeDate]);
  addBubbles(bubbles);
};

var renderInitBubbles = function() {
  $('.loading').fadeOut();
  console.log("RENDERING");
  loadBubbles(5, 5, true, "myanmar");
};

var initFetch = function(cb) {

  $.ajax({
    xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                console.log(percentComplete);
                $('.progress').css({
                  width: percentComplete * 100 + '%'
                });

            }
        }, false);
        xhr.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                console.log(percentComplete);
                $('.progress').css({
                  width: percentComplete * 100 + '%'
                });
            }
        }, false);
        return xhr;
    },
    url: "backup.json",
    success: function (forestBubble) {
      data = forestBubble;
      $('.progress').remove();
      localStorage.setItem('data', JSON.stringify(data));
      cb(); 
    }
  });
};


if (!localStorageData) {
  console.log("FETCHING");
  initFetch(function(){
    renderInitBubbles();
  });
} else {
  console.log("STORED. YAY");
  $('.progress').remove();

  $(document).on('ready', function(){
    renderInitBubbles();
  });

  data = JSON.parse(localStorageData);
}



var checkMapForm = function() {

  var algaeDate = $('input[name=2015-algae]:checked', '#mapform').val();
  var deforestationDate = $('input[name=2015-forest]:checked', '#mapform').val();
  var country = $('input[name=countries]:checked', '#mapform').val();
  var cumulative = $('#cumulative').prop('checked');

  if (!algaeDate || !deforestationDate || !country) {
    alert("Select at least one Algae Date, Deforestation Date, or country");
    return;
  }

  loadBubbles(algaeDate, deforestationDate, cumulative, country);

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

      datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
        console.log(geography.id);
      });

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

});


