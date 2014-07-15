var map;

$(function () {
	console.log("loading...");
	$.ajax({
		url : "web_data.json",
		dataType : "json"
	})
	.done(function(data) {
		init(data);
	});

});

function init(hotels) {
	//Compute mean point
	var lat = 0;
	var lon = 0;
	for (var h in hotels) {
		lat += hotels[h]["latitude"];
		lon += hotels[h]["longitude"];
	}
	lat /= hotels.length;
	lon /= hotels.length;

	//Start map
	var map = L.map('map').setView([lat, lon], 13);
	var baseLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'examples.map-i86knfo3'
	}).addTo(map);
	//Compute the mean score
	mean_score = avgScore(hotels);
	//Add hotels to the layers
	var layers = {};
	for (var h in hotels) {
		h = hotels[h];
		var marker = L.marker([h["latitude"], h["longitude"]]);
		marker.bindPopup(preparePopUp(h, mean_score));
		var key = h["stars"];
		if (!(key in layers)) {
			layers[key] = new L.LayerGroup();
		}
		marker.addTo(layers[key]);
	}
	//Put nice names to the layers
	layers = renameLayers(layers);
	//Add layers to menu
	L.control.layers({}, layers).addTo(map);
	//Activate layers
	for (l in layers) {
		map.addLayer(layers[l]);
	}
}

//Returns the layers object wuth nicer names :)
//E.g.: 1 --> 1 star; 2 --> 2 stars;... ; null --> Non-rated
function renameLayers (layers) {
	var keys = Object.keys(layers);
	for (k in keys) {
		k = keys[k];
		var val = parseInt(k);
		if (!isNaN(val)) {
			if (val == 1) val += " star";
			else val += " stars";
			layers[val] = layers[k];
			delete layers[k];
		}
		else if (k == "null") {
			layers["Non-rated"] = layers[k];
			delete layers[k];
		}
	}
	return layers;
}

//Returns the average score of the list of given hotels
function avgScore(hotels) {
	var res = 0;
	for (var h in hotels) res += hotels[h]["review_score"];
	return res/hotels.length;
}

//Returns the HMTL pop up for the given hotel
function preparePopUp(hotel, mean_score) {
	//Prepare score
	dt_score = Number(hotel["review_score"] - mean_score).toPrecision(3);
	if (dt_score >= 0) dt_score = "<span style='color:green;'><b>+" + dt_score + "</b></span>";
	else dt_score = "<span style='color:red'><b> " + dt_score + "</b></span>";
	//Prepare stars
	stars = hotel["stars"];
	if (stars == null) stars = "";
	else if (stars == "1") stars = " - 1 star";
	else stars = " - " + stars  + " stars";
	//Prepare pop-up
	var res = "";
	res += "<b>" + hotel["name"] + "</b>" + stars + " (" + hotel["review_score"]  + ")" + dt_score + "<br>";
	res += "<i>Address</i>: " + hotel["hotel_address"] + "<br>";
	res += "<b>Good</b>: " + hotel["top_good_words"].split("##").join(", ") + "<br>";
	res += "<b>Bad</b>: " + hotel["top_bad_words"].split("##").join(", ") + "<br>";
	return res;
}
