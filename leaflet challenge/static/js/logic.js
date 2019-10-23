 // Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);

});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + "Mag:" + feature.properties.mag + "  Place: " + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    function getradius(magnitude){
    if (magnitude === 0){return 1};
    return magnitude *4
    ;}

    function geojsonMarkerOptions(feature)  {
    return{
            radius: getradius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            color: "#000",
            weight: 1,
            opacity: 0,
            fillOpacity: 1
        };}
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
    },
    style: geojsonMarkerOptions,
    onEachFeature: onEachFeature
    });

    //var plates = L.geoJSON('PB2002_plates.JSON');
    function fetchJSON(url) {
      return fetch(url)
        .then(function(response) {
          return response.json();
        });
    }
    var plates = fetchJSON('static/PB2002_plates.JSON')
            .then(function(data) {
              createMap(earthquakes,data);
              return data 
            })

    // Sending our earthquakes layer to the createMap function
    
}       

function createMap(earthquakes,plates) {

  // Define streetmap and darkmap layers
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: "pk.eyJ1IjoiY2hlbmdjaGVuZ2dhbiIsImEiOiJjazA3ZjA4ZHEwMGtqM2dsbThzNTlreTh4In0.5XABmfCh-1zknPb1YmzxqA"
  });

  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: "pk.eyJ1IjoiY2hlbmdjaGVuZ2dhbiIsImEiOiJjazA3ZjA4ZHEwMGtqM2dsbThzNTlreTh4In0.5XABmfCh-1zknPb1YmzxqA"
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: "pk.eyJ1IjoiY2hlbmdjaGVuZ2dhbiIsImEiOiJjazA3ZjA4ZHEwMGtqM2dsbThzNTlreTh4In0.5XABmfCh-1zknPb1YmzxqA"
  });

 


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Grayscale Map": lightmap,
    "Satellite Map": satellitemap,
    "Outdoors Map":outdoorsmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines":plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });
  var geojsonMarkerOptions = {
      radius: 8,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng);  
      },
      // style: geojsonMarkerOptions,
    collapsed: false
  }).addTo(myMap);

  // Create a legend to display information about our map
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      mag = [0, 1, 2, 3, 4, 5],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mag.length; i++) {
      div.innerHTML += '<i style="background:' + getColor(mag[i] + 1) + '"></i> ' + 
      mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
      
    }

    return div;
  };

  legend.addTo(myMap);


}


function getColor(d) {
	return d > 5 ? '#FF0000' :
	       d > 4  ? '#FFA500' :
	       d > 3  ? '#ffd700' :
	       d > 2  ? '#FFFF00' :
	       d > 1   ? '#9ACD32' :
	                  '#ADFF2F';
}



