var centerMap = [45.189, 5.725];
var map = L.map('map').setView(centerMap, 4);
var layer = L.esri.basemapLayer('Topographic').addTo(map);
var scale = L.control.scale().addTo(map);
var layerLabels;
var basemaps = document.getElementById('basemaps');
//var marker = L.marker(centerMap).addTo(map);
var popup = L.popup();
// Add geolocation control
L.control.locate({
  follow: false,
  icon: 'fa fa-bullseye', // class for icon, fa-location-arrow or fa-map-marker
  iconLoading: 'fa fa-spinner fa-spin', // class for loading icon
  showPopup: false,
  locateOptions: {
    maxZoom: 14
  }
}).addTo(map);
var searchControl = new L.esri.Controls.Geosearch().addTo(map);
var results = new L.LayerGroup().addTo(map);

searchControl.on('results', function(data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    results.addLayer(L.marker(data.results[i].latlng));
  }
});

map.on('click', onMapClick);


basemaps.addEventListener('change', function() {
  changeBasemap(basemaps.value);
});

function onMapClick(evt) {
  var latlon = evt.latlng;
  var lat = latlon.lat;
  var lon = latlon.lng;
  var webmercator = geographicToWebMercator(lon, lat);
  var dms = convertToDegreMinSec(lon, lat);
  var zoomLevel = map.getZoom();
  popup.setLatLng(evt.latlng)
    .setContent('You clicked the map at zoom level ' + zoomLevel + '<br/>' + evt.latlng.toString() + '<br/>' +
      'LngLat(' + lon.toFixed(5) + ',' + lat.toFixed(5) + ')<br/>' +
      'webmercator LatLng(' + webmercator.x + ',' + webmercator.y + ') <br/>' +
      'webmercator LngLat(' + webmercator.y + ',' + webmercator.x + ') <br/>' +
      'DMS LatLng(' + dms.latitude + ',' + dms.longitude + ') <br/>' +
      '<a href=\'http://maps.googleapis.com/maps/api/streetview?size=600x380&location=' + lat + ',' + lon + '\' target=\'_blank\'>google street view</a>'
    ).openOn(map);
}

function changeBasemap(basemap) {
  if (layer) {
    map.removeLayer(layer);
  }
  layer = L.esri.basemapLayer(basemap);
  map.addLayer(layer);
  if (layerLabels) {
    map.removeLayer(layerLabels);
  }
  if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {
    layerLabels = L.esri.basemapLayer(basemap + 'Labels');
    map.addLayer(layerLabels);
  }
}

function geographicToWebMercator(x_lon, y_lat) {
  var x_mercator, y_mercator;
  if (Math.abs(x_lon) <= 180 && Math.abs(y_lat) < 90) {
    var num = x_lon * 0.017453292519943295;
    var x = 6378137.0 * num;
    var a = y_lat * 0.017453292519943295;
    x_mercator = x;
    y_mercator = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
  } else {
    console.error('Invalid coordinate values for conversion');
  }
  return {
    'x': x_mercator.toFixed(7),
    'y': y_mercator.toFixed(7)
  };
}

function convertToDegreMinSec(lon, lat) {
  var lonAbs = Math.abs(Math.round(lon * 1000000.0));
  var latAbs = Math.abs(Math.round(lat * 1000000.0));
  var signlon = 'E';
  var signlat = 'N';
  if (lon < 0) {
    signlon = 'W';
  }
  if (lat < 0) {
    signlat = 'S';
  }
  if (lonAbs > (180 * 1000000)) {
    console.error(' Degrees Longitude must be in the range of -180 to 180. ');
    return;
  }
  if (latAbs > (90 * 1000000)) {
    console.error(' Degrees Latitude must be in the range of -90. to 90. ');
    return;
  }
  var latDMS = (signlat + ' ' + Math.floor(latAbs / 1000000) + '&deg; ' + Math.floor(((latAbs / 1000000) - Math.floor(latAbs / 1000000)) * 60) + '\' ' + (Math.floor(((((latAbs / 1000000) - Math.floor(latAbs / 1000000)) * 60) - Math.floor(((latAbs / 1000000) - Math.floor(latAbs / 1000000)) * 60)) * 100000) * 60 / 100000) + '&quot;');
  var lonDMS = (signlon + ' ' + Math.floor(lonAbs / 1000000) + '&deg; ' + Math.floor(((lonAbs / 1000000) - Math.floor(lonAbs / 1000000)) * 60) + '\' ' + (Math.floor(((((lonAbs / 1000000) - Math.floor(lonAbs / 1000000)) * 60) - Math.floor(((lonAbs / 1000000) - Math.floor(lonAbs / 1000000)) * 60)) * 100000) * 60 / 100000) + '&quot;');
  return {
    'longitude': lonDMS,
    'latitude': latDMS
  };
}
