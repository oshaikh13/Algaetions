// map.js

// TODO: Use an MVC Framework 
// idk react seems kewl. 
// Model would be this localstorage.
// View would be controlled with datamaps. 


// For anyone peeking. Localstorage is the coolest thing ever.
// You can store strings on the client. STORE THEM :p
// No need to make heavy ajax calls.
var localStorageData = localStorage.getItem('data');

// Data "schema"
// Algae data was given. I wrote a parser for that data. look at the github repo.
// Forest data, however, was from FORMA. 
// Thanks Global Forest Watch for that wicked API <3. And James Lane Conkling u idiot.
var data = {
  algae : {},
  deforestation: {
    countries : {

    }
  }
};

// Does nothing rn
var autoSwitch = true;

var bubbles = [];
var addBubbles;

var storeLocal = function() {
  localStorage.setItem('data', JSON.stringify(data));
};

// Work on only editing settings. These are the defaults. The form reads and edits.
// Maybe store this in localStorage?
// TODO: Finish this. Currently incomplete.
var selectedOptions = {
  country: "myanmar",
  algaeDate: 5,
  deforestationDate: 5,
  cumulative: true
};

var loadBubbles = function(algaeDate, deforestationDate, cumulative, country) {
  bubbles = [];
  algaeDate = parseInt(algaeDate);
  deforestationDate = parseInt(deforestationDate);

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
  // For some reason, fadeout wouldn't work lol
  // idk probs the overlay blocking us from modifying the elements. (makes sense?)
  // just used remove instead. same effect. 
  $('.loading').remove();
  loadBubbles(6, 6, true, "myanmar");
};

var initFetch = function(cb) {

  $.ajax({
    xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;

                $('.progress').css({
                  width: percentComplete * 100 + '%'
                });

            }
        }, false);
        xhr.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;

                $('.progress').css({
                  width: percentComplete * 100 + '%'
                });
            }
        }, false);
        return xhr;
    },
    url: "/data",
    success: function (forestBubble) {
      data = forestBubble;
      $('.progress').remove();
      localStorage.setItem('data', JSON.stringify(data));
      cb(); 
    }
  });
};





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

var handleCountryClick = function(area) {
  if (area === "IND") {
    loadBubbles(6, 6, true, "india");
  } else if (area === "MMR") {
    loadBubbles(6, 6, true, "myanmar");
  } else if (area === "THA") {
    loadBubbles(6, 6, true, "thailand");
  } else if (area === "BGD") {
    loadBubbles(6, 6, true, "bangladesh");
  }
};

$(document).ready(function(argument) {

  var mapElem = document.getElementById('map-view');

  // debugger;
  var setHeight = $(document).height() * 0.95; //if not null, datamaps will grab the height of 'element'


  var algaeMap = new Datamap({
    element: mapElem,
    scope: 'world',
    height: setHeight,
    geographyConfig: {
      highlightOnHover: false
    },
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
      // create the zoom behvavior
      var zoom = d3.behavior.zoom()
        // only scale up, e.g. between 1x and 10x
        .scaleExtent([1, 10]) // Some d3 witchcraft.
        .on("zoom", redraw);

      datamap.svg.call(zoom);

      datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
        handleCountryClick(geography.id);
      });

      function redraw() {
        datamap.svg.selectAll("g")
          .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }
    }
  });


  addBubbles = function (bubbleParam) {
    algaeMap.bubbles(bubbleParam, {
      popupTemplate: function(geo, bubble) {
        return ['<div class="hoverinfo">' + bubble.radius,
          '<br/>Longitude: ' + bubble.longitude + '',
          '<br/>Latitude: ' + bubble.latitude + '',
          '</div>'
        ].join('');
      }
    });
  };



  if (!localStorageData) {
    initFetch(function(){
      renderInitBubbles();
    });
  } else {
    $('.progress').remove();
    data = JSON.parse(localStorageData);
    renderInitBubbles();
  }

});

