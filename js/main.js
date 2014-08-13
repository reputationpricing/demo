var map;
//We have 6 layer all of them initially visible
var layers_state = {
	"Non-rated" : {state : true, name: null},
	"1 star" : {state : true, name: 1},
	"2 stars" : {state : true, name: 2},
	"3 stars" : {state : true, name: 3},
	"4 stars" : {state : true, name: 4},
	"5 stars" : {state : true, name: 5},
};
var aggDataByStars = {};
var curAvg = -1;

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

	//Connect events
	map.on('overlayadd', function(e) {
		changeLayerState(e.name, true);
	});
	map.on('overlayremove', function(e) {
		changeLayerState(e.name, false);
	});
	map.on('popupopen', function (e) {
		//Get the source
		var src = e.popup._contentNode.innerHTML;
		src = $("<div>" + src + "</div>");
		//Get the current score
		var score = src.find(".score_info").data("score");
		var dt = getDTScoreHTML(score - curAvg);
		//Update the inner HTML
		src.find(".diffGrade").replaceWith(dt)
		//Set the HTML for the popup
		e.popup.setContent(src.html());
	});
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
	aggDataByStars = {
		null : {sum: 0, count: 0},
		1 : {sum: 0, count: 0},
		2 : {sum: 0, count: 0},
		3 : {sum: 0, count: 0},
		4 : {sum: 0, count: 0},
		5 : {sum: 0, count: 0}
	};
	for (var h in hotels) {
		aggDataByStars[hotels[h]['stars']].sum += hotels[h]["review_score"];
		aggDataByStars[hotels[h]['stars']].count += 1;
		res += hotels[h]["review_score"];
	}
	curAvg = res/hotels.length;
	return curAvg;
}

//Generates the HTML code the rating in colors
function getDTScoreHTML(dt) {
	dt = Number(dt).toPrecision(3);
	if (dt >= 0) return "<span class='diffGrade' style='color:green;'><b>+" + dt + "</b></span>";
	else return "<span class='diffGrade' style='color:red'><b> " + dt + "</b></span>";

}

//Returns the HMTL pop up for the given hotel
function preparePopUp(hotel, mean_score) {
	//Prepare score
	dt_score = hotel["review_score"] - mean_score;
	dt_score = getDTScoreHTML(dt_score);
	//Prepare stars
	stars = hotel["stars"];
	if (stars == null) stars = "";
	else if (stars == "1") stars = " - 1 star";
	else stars = " - " + stars  + " stars";
	//Prepare pop-up
	var res = "";
	res += "<b>" + hotel["name"] + "</b>" + stars + "<span class='score_info' data-score='" + hotel["review_score"] + "'> ("  + hotel["review_score"]  + ") " + dt_score + "</span><br>";
	res += "<i>Address</i>: " + hotel["hotel_address"] + "<br>";
	res += "<b>Good</b>: " + hotel["top_good_words"].split("##").join(", ") + "<br>";
	res += "<b>Bad</b>: " + hotel["top_bad_words"].split("##").join(", ") + "<br>";
	return res;
}

//Change the state of the given layer, on == True when shown, otherwise false
function changeLayerState(name, on) {
	layers_state[name].state = on;
	updateLayers()
}

//Update the displayed mean and differences
function updateLayers() {
	//Compute current average
	var sum = 0;
	var count = 0;
	var l;
	for (l in layers_state) {
		if (layers_state[l].state) {
			var tmp = aggDataByStars[layers_state[l].name];
			sum += tmp.sum;
			count += tmp.count;
		}
	}
	if (count > 0) curAvg = sum/count;
	else curAvg = 0;
	//Update current popup (if any)
	var score = $(".score_info").data("score");
	var dt = getDTScoreHTML(score - curAvg);
	$(".diffGrade").replaceWith(dt)

}
