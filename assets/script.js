//Mapbox Access Token
L.mapbox.accessToken = 'pk.eyJ1IjoiaG9ja2V5ZHVjazMwIiwiYSI6InE4cmFHNlUifQ.X5m_TSatNjZs6Vc7B3_m2A';

//Basemap: Mapbox Emerald (Set at lower zooms)
var mbEmerald = L.tileLayer('https://api.mapbox.com/v4/mapbox.emerald/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaG9ja2V5ZHVjazMwIiwiYSI6InE4cmFHNlUifQ.X5m_TSatNjZs6Vc7B3_m2A', {
	minZoom: 2,
	maxZoom: 7,
	zIndex: 1,
	attribution: "&copy; <a href='https://www.mapbox.com/map-feedback/'>Mapbox</a>, <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
});

//Basemap: Mapbox Streets Satellite (Set at higher zooms)
var mbStreetSat = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaG9ja2V5ZHVjazMwIiwiYSI6InE4cmFHNlUifQ.X5m_TSatNjZs6Vc7B3_m2A', {
	minZoom: 8,
	maxZoom: 20,
	zIndex: 2,
	attribution: "&copy; <a href='https://www.mapbox.com/map-feedback/'>Mapbox</a>, <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
});

/* Polygon Mouseover Function */
function polygonMouseOver(e) {
	var layer = e.target;
		//Change the polygon style
		e.target.setStyle({
				weight: 4,
				color: '#67000D',
				fillOpacity: 1,
				fillOpacity: 0.7,
				dashArray: ''
		});
		//IE & Opera Browser Support
		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}
		//Update the Text Dialog Box
		textDialogBox.update(layer.feature.properties);
}

/* Reset Polygon Function */
function resetPolygon(e) {
	//Reset the Text Dialog Box
	textDialogBox.update();
	 //Reset the polygon style
	adventures.resetStyle(e.target);
}

/* Zoom to Feature Function */
function zoomToFeature(e) {
	adventures.resetStyle(e.target);
	map.fitBounds(e.target.getBounds());
}

//Adventures around the Globe
var adventures = L.geoJson(null, {
	style: function (feature) {
		return {
			color: '#a50f15',
			fillColor: '#fc9272',
			dashArray: '3',
			weight: '3',
			opacity: 1
		};
  },
  onEachFeature: function (feature, layer) {
		layer.on({
				mouseover: polygonMouseOver,
				mouseout: resetPolygon,
				click: zoomToFeature
			});
    }
});
$.getJSON("data/adventures.json", function (data) {
  adventures.addData(data);
});

//Cities Visited
var visitedCities = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
	  return new L.CircleMarker(latlng, {
      	radius: 5,
      	fillOpacity: 0.85,
      	color: "#000",
      	clickable: false
      });
  },
  onEachFeature: function (feature, layer) {
	  //Popup
	  layer.bindLabel(
			  feature.properties.City, {
				  noHide: true,
					clickable: true
	  });
  }
});
$.getJSON("data/cities.json", function (data) {
  visitedCities.addData(data);
});

//Points of Interest, or Major highlights
var majorHighlights = L.geoJson(null, {
	  pointToLayer: L.mapbox.marker.style,
  onEachFeature: function (feature, layer) {
		layer.options.riseOnHover = true; //Rise each feature on hover
		layer.options.title = feature.properties.Name; //Add a title on hover
		//Popup
		if (feature.properties.Image) {
	  layer.bindPopup(
			  "<b>" + feature.properties.Name + "</b><br />" +
			  "<i>" + feature.properties.City + ", " + feature.properties.Region + "</i><br />" +
			  feature.properties.Comments + "<br />" +
			"<img src='photos/" + feature.properties.Image + ".JPG' width='250' height='200'></img><br />"
	   );
	 } else {
		 layer.bindPopup(
				 "<b>" + feature.properties.Name + "</b><br />" +
				 "<i>" + feature.properties.City + ", " + feature.properties.Region + "</i><br />" +
				 feature.properties.Comments + "<br />"
			);
	 } //End popup
  }
});
$.getJSON("data/highlights.json", function (data) {
	majorHighlights.addData(data);
});

//Define the map
var map = L.map('map', {
  center: [0, 0],
  zoom: 2,
  layers: [mbEmerald, mbStreetSat, adventures]
});

//Add coordinate hash
var hash = new L.Hash(map);

// Control button zoom: Italy
var homeButton = L.easyButton('fa-home', function(control){
	map.setView([0, 0], 2);
	this.disable(); //Disables the button on click
}).addTo(map);

// Control button zoom: Alaska
var alaskaButton = L.easyButton('fa-anchor', function(control){
	map.setView([61.68, -149.05], 6);
	this.disable(); //Disables the button on click
}).addTo(map);

// Control button zoom: Italy
var italyButton = L.easyButton('fa-university', function(control){
	map.setView([43.08, 12.53], 7);
	this.disable(); //Disables the button on click
}).addTo(map);

/********************/
/* TEXT DIALOG BOX */
/******************/
var textDialogBox = L.control();
textDialogBox.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'textDialogBox');
    this.update();
    return this._div;
};
// Update the Text Dialog Box when the properties change
textDialogBox.update = function (attributes) {
    this._div.innerHTML = (attributes ?
				"<h4>" + attributes.Adventure + "</h4>" +
				"<b><i>" + attributes.Description + "</i></b><br />" +
				attributes.Days + " days, " + attributes.Nights + " nights<br /><br />" +
				"<i>Visited " + attributes.Visited + "</i>"
        : '<b>Hover over an adventure</b>');
};
//Add the Text Dialog Box to the Map
textDialogBox.addTo(map);

/******************************/
/****** EVENT LISTENERS ******/
/****************************/
// Disable the Home button on load
homeButton.disable();

// Add or remove layers based on the map zoom, after the zoom has completed.
map.on('zoomend', function () {
	/* Adventures layer */
	if (map.getZoom() > 2 && map.hasLayer(adventures)) { map.removeLayer(adventures); }
	if (map.getZoom() == 2 && map.hasLayer(adventures) == false) { map.addLayer(adventures); }
	/* Visited cities layer */
	//TODO: Cleanup the line below to remove visitedCities at the ZoomLayer of 2
	//This currently has both the visitedCities & adventures layers on (only adventures should be shown)
	if (map.getZoom() >= 3 && map.getZoom() < 7 && map.hasLayer(visitedCities)) { map.removeLayer(visitedCities); }
	if (map.getZoom() <= 7 && map.hasLayer(visitedCities) == false) { map.addLayer(visitedCities); }
	/* Major highlights layer */
	//TODO: Clean this up
	if (map.getZoom() < 6 && map.hasLayer(majorHighlights)) { map.removeLayer(majorHighlights); }
	if (map.getZoom() >= 6 && map.hasLayer(majorHighlights) == false) { map.addLayer(majorHighlights); }
	/* Text Dialog Box */
	//TODO: Cleanup the line below to better identify if the textDialogBox is active in the map or not
	//This currently hiccups when the textDialogBox isn't in the map at higher zooms (> 2)
	if (map.getZoom() > 2) { textDialogBox.removeFrom(map); }
	if (map.getZoom() <= 2) { textDialogBox.addTo(map); }
});

//TODO: Disable buttons more seamlessly when clicked

// Re-enable the buttons on move.
map.on('zoomend move click', function(e) {
	homeButton.enable();
	alaskaButton.enable();
	italyButton.enable();
});
