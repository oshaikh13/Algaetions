$(document).ready(function (argument) {
  var colors = d3.scale.category10();
  var mapElem = document.getElementById('map-view');

  // debugger;
  var setHeight = $(document).height() * .9; //if not null, datamaps will grab the height of 'element'


  var zoom = new Datamap({
    element: document.getElementById("map-view"),
    scope: 'world',
    height: setHeight,
    // Zoom in on Africa
    setProjection: function(element) {
      var projection = d3.geo.equirectangular()
        .center([92.0000, 15.0000])
        .rotate([4.4, 0])
        .scale(1000)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
      var path = d3.geo.path()
        .projection(projection);

      return {path: path, projection: projection};
    },
    fills: {
      defaultFill: "#ABDDA4",
      gt50: colors(Math.random() * 20),
      eq50: colors(Math.random() * 20),
      lt25: colors(Math.random() * 10),
      gt75: colors(Math.random() * 200),
      lt50: colors(Math.random() * 20),
      eq0: colors(Math.random() * 1),
      pink: '#0fa0fa',
      gt500: colors(Math.random() * 1)
    },
    data: {
      'ZAF': { fillKey: 'gt50' },
      'ZWE': { fillKey: 'lt25' },
      'NGA': { fillKey: 'lt50' },
      'MOZ': { fillKey: 'eq50' },
      'MDG': { fillKey: 'eq50' },
      'EGY': { fillKey: 'gt75' },
      'TZA': { fillKey: 'gt75' },
      'LBY': { fillKey: 'eq0' },
      'DZA': { fillKey: 'gt500' },
      'SSD': { fillKey: 'pink' },
      'SOM': { fillKey: 'gt50' },
      'GIB': { fillKey: 'eq50' },
      'AGO': { fillKey: 'lt50' }
    }
  });
          

  // body...
})