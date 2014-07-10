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
	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'examples.map-i86knfo3'
	}).addTo(map);
	
	//Add hotels
	for (var h in hotels) {
		L.marker([hotels[h]["latitude"], hotels[h]["longitude"]]).addTo(map).bindPopup(preparePopUp(hotels[h]));
	}
 
}

function preparePopUp(hotel) {
	var res = "";
	res += "<b>" + hotel["name"] + "</b> (" + hotel["review_score"]  + ")<br>";
	res += "<i>Address</i>: " + hotel["hotel_address"] + "<br>";
	res += "<b>Good</b>: " + hotel["top_good_words"].split("##").join(", ") + "<br>";
	res += "<b>Bad</b>: " + hotel["top_bad_words"].split("##").join(", ") + "<br>";
	return res;
}
