var PLOT_SIZE = 800;
var PLOT_WIDTH = "100%";
var PLOT_WIDTH = screen.width;
var CENTER_X = 250;
var CENTER_Y = 250;
var COUNTRIES_RADIUS = 100;

var g, force, edges, countries, lines, nodes, color;

function xCircle(i, n) {
	return Math.cos(i*2*Math.PI/n);
}

function yCircle(i, n) {
	return Math.sin(i*2*Math.PI/n);
}

function display(data) {
	//Subarray
	data = data.slice(0,2);
	var n = data.length;
	//console.log(data);
	edges = [];
	for (var i = 0; i < n; i++) {
		for (var j = 0; j < i; j++) {
			edges.push({"source":i,"target":j, "visible":false, "length":1000});
		}
	}

	//Generate the information for the
	words = {}
	nodes = data;
	for (c in data) {
		ws = data[c]["good"].split("##");
		for (w in ws) {
			w = ws[w];
			w = w.split("(")[0]
			if (words[w] == undefined) {
				words[w] = nodes.length 
				nodes.push({"is_word":true, "word":w})
			}
			edges.push({"source" : parseInt(c), "target": parseInt(words[w]), 
					"visible":true, "length":250})
		}
	}
	console.log(words);
	//console.log(nodes);
	console.log(edges);
	data = nodes
	console.log(data);

	force = d3.layout.force()
		.nodes(data)
		.links(edges)
		.size([PLOT_WIDTH, PLOT_SIZE])
		.linkDistance(function(d,i) {return d["length"]})
		//.charge([-1500])
		.charge(function(d,i){
			if (d["is_word"]) return -2500;
			else return -5500;
		})
		.gravity(0.3)
		.start();
	
	lines = g.selectAll("line")
			.data(edges)
			.enter()
			.append("line")
			.attr("stroke", "black")
			.attr("opacity", function(d,i) {
				if (d["visible"]) return 1.0;
				else return 0.0;
			});

	nodes = g.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			//.attr("r", 20)
			.attr("r", function(d,i){
				if (d["is_word"] == undefined) return 100;
				else return 20;
			})
			//.attr("opacity", 1.0)
			//.attr("fill", "gray")
			.attr("fill", function (d,i) {
				if (d["is_word"] == undefined) return "orange"
				else return "cyan"
			})
			.call(force.drag);

	countries = g.selectAll("text")
			.data(data)
			.enter()
			.append("text")
			.attr("style", "text-anchor:middle")
			.attr("fill", "black")
			.attr("font-size", "20px")
			.text(function (d,i) {
				if (d["is_word"] == undefined)
					return d.country;
				else return d.word
			});

	force.on("tick", function() {
		lines.attr("x1", function(d, i){return d.source.x})
			.attr("y1", function(d,i){return d.source.y})
			.attr("x2", function(d,i){return d.target.x})
			.attr("y2", function(d,i){return d.target.y});
		nodes.attr("cx", function(d,i) {return d.x})
			.attr("cy", function(d,i){return d.y});
		countries.attr("transform", function(d){
				return "translate(" + d.x + "," + d.y + ")";
			});
	});

}

function init() {
	g = d3.select("#graph").append("svg")
		.attr("width", PLOT_WIDTH).attr("height", PLOT_SIZE);
	color = d3.scale.category10();
	$.ajax({
                url : "words_by_country.json",
                dataType : "json"
	})
        .done(function(data) {
                display(data);
        });	
}
$(function() {
	console.log("Hello!");
	init();
});
