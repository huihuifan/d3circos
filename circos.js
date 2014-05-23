var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1060 - margin.left - margin.right;

var height = 1000 - margin.bottom - margin.top;

bb_viz= {
    x: 0,
    y: 0,
    w: 500,
    h: 500
};

svg = d3.select("#stat_graphs").append("svg").attr({
	width: width + margin.left + margin.right,
	height: height + margin.bottom + margin.top
})
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chord_graph = svg.append("g")
	.attr("class", "chord_graph")
	.attr("transform", "translate(" + (bb_viz.x+(bb_viz.w/2)) + "," + (bb_viz.y +(bb_viz.h / 2)) + ")");

d3.select("input[name=filter]").on("change", function() { 
	d3.select("#filter .filterInput").text("Less than " + this.value);
	rerender(this.value);  
});

//tool tip setup
var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0,0]);

svg.call(tip);

var tooltip = d3.select("#stat_graphs").append("div").attr("class", "tooltip hidden")

var matrix = [	[105, 450, 92, 96, 301, 1500, 0, 0, 0],
			 	[20, 46, 78, 33, 53, 28, 83, 0, 0],
			 	[118, 553, 94, 317, 25, 83, 0, 0, 0],
			 	[100, 18, 108, 104, 105, 25, 173, 0, 0],
			 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
			 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
			 	[23, 83, 123, 342, 98, 48, 205, 0, 0],
			 	[173, 438, 103, 325, 82, 215, 23, 0, 0],
			 	[305, 173, 138, 49, 81, 258, 207, 0, 0]	];

var fill = d3.scale.ordinal()
    .domain([0, 1500])
    .range(["#3288bd","#66c2a5","#abdda4","#e6f598","#fee08b","#fdae61","#f46d43","#d53e4f"]);

var fill_in= d3.scale.ordinal()
    .domain([0, 1500])
    .range(["#8c510a","#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e"]);

var upreg = d3.scale.pow().exponent(.35)
    .domain([0, 1500])
    .range(["red", "green"]);


draw_circos(matrix);


function draw_circos(matrix) {

	chord_graph.selectAll("text").remove();
	d3.selectAll(".legend").remove();

	var pathnames = ["Circadian Clock", "Photoperiod", "Casein Kinase", "Vernalization", "Flower Development", "Gibberellic Acid Production", "Autonomous Flowering Time", "Long Day", "Short Day"]
	var genes = ["PHYA", "PHYB", "PHYD", "PHYE", "CRY1", "CRY2", "PRR9", "PRR7", "ELF3", "LUX", "ELF4",
				"LHY", "CCA1", "TOC-1", "PIF6", "GI", "CK2 alpha A", "CK2 alpha B", "CK2 alpha C", "CK2 B1",
				"CK2 B2", "CK2 B3", "CK2 B4", "CO", "FT", "SPY", "SOC1", "WP618", "FRI", "FLC",
				"FCA", "LD", "FTA", "F4b", "SUR", "NRA1", "SUR1", "ATAC1", "ATAC2"]

	var chord = d3.layout.chord()
	    .padding(.05)
	    .sortSubgroups(d3.descending)
	    .matrix(matrix);

	var chord_width = bb_viz.w,
	    chord_height = bb_viz.h,
	    innerRadius = Math.min(chord_width, chord_height) * .41,
	    outerRadius = innerRadius * 1.1;

	var inRad = Math.min(chord_width*.46, chord_height*.46),
		outRad = inRad*1.05;

	var inRad1 = Math.min(chord_width*.49, chord_height*.49),
		outRad1 = inRad1*1.05;

	var arcs = chord_graph.append("g").attr("class","arcs").selectAll("path")
	    .data(chord.groups)
	  .enter()
	  	.append("path")
	  	.on("mouseover", function(d,i) {

	    	tip.html(pathnames[d.index]);

	    	tip.show(d);

	    	fade(.1)(d,i);

	    })
	    .on("mouseout", function(d,i){
	    	tip.hide(d);

	    	fade(1)(d,i);

	   	})	    
	   	.style("fill", function(d) {
	   		return fill(d.value);
	   	})
	    .style("opacity", 0)
	   	.transition().duration(1000)
	   	.style("opacity", 1)
	    .style("stroke", "white")
	    .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius));

	var up_down = [];

	for (i in chord.chords()) {
		up_down.push(chord.chords()[i].source)
	}

	var something = [];

	for (i in chord.chords()) {
		something.push(chord.chords()[i].target)
		something.push(chord.chords()[i].source)
	}

	chord_graph.append("g").attr("class","fill_arc").selectAll("path")
	    .data(up_down)
	  .enter()
	  	.append("path")
	    .style("opacity", 0)
	   	.transition().duration(1000)
	   	.style("fill", function(d,i) {
	   		return upreg(d.value);
	   	})
	   	.style("opacity", 1)
	    .style("stroke", "white")
	    .attr("d", d3.svg.arc().innerRadius(inRad).outerRadius(outRad));

	chord_graph.append("g").attr("class","arcs").selectAll("path")
	    .data(something)
	  .enter()
	  	.append("path")
	   	.style("fill", function(d) {
	   		return fill_in(d.value);
	   	})
	    .style("opacity", 0)
	   	.transition().duration(1000)
	   	.style("opacity", 1)
	    .style("stroke", "white")
	    .attr("d", d3.svg.arc().innerRadius(inRad1).outerRadius(outRad1));

	chord_graph.append("g")
	    .attr("class", "chord")
	  .selectAll("path")
	    .data(chord.chords)
	  .enter()
	  	.append("path")
	  	.style("fill", function(d) {
	  		//console.log(d)
	  		return fill(d.source.value);
	  	})
	  	.on("mouseover", function(d,i) {
	    	 var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

                //toggle the hide on the tooltip
                tooltip.classed("hidden", false)
                    .attr("style", "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]+20)+"px")
                    .html(function(){
                    	return genes[i]
                    })
	    })
	    .on("mouseout", function(d) {
	    	tooltip.classed("hidden", true);
	    })
	    .style("opacity", 0)
	  	.transition().duration(1000)
	    .attr("d", d3.svg.chord().radius(innerRadius))
	    .style("opacity", .7);

	chord_graph
			.append("text")
			.attr("y", -270)
			.attr("text-anchor", "middle")
			.attr("class", "text")
			.text("Gene Expression Differences between Pathways");

	// Returns an event handler for fading a given chord group.
	function fade(opacity) {
	  return function(g, i) {
	  	//console.log(i)
	    chord_graph.selectAll(".chord path")
	        .filter(function(d) { 
	        	return d.source.index != i && d.target.index != i; 
	        })
	      .transition()
	        .style("opacity", opacity);
	  };
	}

	var legend = d3.select("#stat_graphs svg").append("g")
      .attr("class", "legend")
      .attr("width", innerRadius * 2)
      .attr("height", outerRadius * 2)
    .selectAll("g")
      .data(fill_in.domain().slice().reverse().splice(8,8))
    .enter().append("g")
      .attr("transform", function(d, i) { 
      	return "translate(650," + ((i * 20)+30) + ")"; 
      });


  	legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", fill_in)
      .style("stroke-width", "3px");

    var names = ["Cell Membrane", "Cell Cycle", "Development", "Metabolic Process", "Stimulus Response", "Signaling", "Transport", "Regulation"];

    chord_graph.append("text")
    	.attr("x", 348)
    	.attr("y", -280)
    	.text("Outer Ring- Gene Ontology Terms")
    	.style("font-weight", "normal");

   	chord_graph.append("text")
   		.attr("x", 348)
   		.attr("y", 10)
   		.text("Inner Ring- Gene Families")

  	legend.append("text")
      	.attr("x", 24)
      	.attr("y", 9)
      	.attr("dy", ".35em")
      	.text(function(d,i) { return names[i]; });

    chord_graph.append("text")
    	.attr("x", 348)
    	.attr("y", -60)
    	.text("Middle Ring- Down/Up Regulation");

    var legend_inner = d3.select("#stat_graphs svg").append("g")
      	.attr("class", "legend")
      	.attr("width", innerRadius * 2)
      	.attr("height", outerRadius * 2)
    .selectAll("g")
      	.data(fill_in.domain().slice().reverse().splice(8,8))
    .enter().append("g")
      	.attr("transform", function(d, i) { 
      		return "translate(650," + ((i * 20)+330) + ")"; 
      	});

  	legend_inner.append("rect")
      	.attr("width", 18)
      	.attr("height", 18)
      	.style("fill", fill)
      	.style("stroke-width", "3px");

  	legend_inner.append("text")
      	.attr("x", 24)
      	.attr("y", 9)
      	.attr("dy", ".35em")
      	.text(function(d,i) { return pathnames[i]; });

    var gradient = chord_graph.append("svg:defs")
    	.append("svg:linearGradient")
    	.attr("id", "gradient")
    	.attr("x1", "0%")
    	.attr("y1", "0%")
    	.attr("x2", "100%")
    	.attr("y2", "10%")
    	.attr("spreadMethod", "pad");

    gradient.append("svg:stop")
    	.attr("offset", "0%")
    	.attr("stop-color", "red")
    	.attr("stop-opacity", 1);

    gradient.append("svg:stop")
    	.attr("offset", "100%")
    	.attr("stop-color", "green")
    	.attr("stop-opacity", 1);

    svg.append("svg:rect")
    	.attr("width", 200)
    	.attr("height", 30)
    	.attr("x", 596)
    	.attr("y", 200)
        .attr("class", "legend_gradient")
    	.style("fill", "url(#gradient)")
    	.style("stroke-width", "2px")
    	.style("stroke", "white");


}


function rerender(filter_value) {

	d3.selectAll(".chord")
		.transition()
		.style("opacity", 0)
		.duration(1000)
		.remove();

	d3.selectAll(".arcs")
		.transition()
		.style("opacity", 0)
		.duration(1000)
		.remove();

    d3.selectAll(".fill_arc")
        .transition()
        .style("opacity", 0)
        .duration(1000)
        .remove();

    d3.selectAll("defs")
        .remove();

    d3.selectAll(".legend_gradient")
        .remove();

	create_matrix(filter_value);

}

function create_matrix(filter_value) {

	var new_matrix = [	[105, 450, 92, 96, 301, 1500, 0, 0, 0],
			 	[20, 46, 78, 33, 53, 28, 83, 0, 0],
			 	[118, 553, 94, 317, 25, 83, 0, 0, 0],
			 	[100, 18, 108, 104, 105, 25, 173, 0, 0],
			 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
			 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
			 	[23, 83, 123, 342, 98, 48, 205, 0, 0],
			 	[173, 438, 103, 325, 82, 215, 23, 0, 0],
			 	[305, 173, 138, 49, 81, 258, 207, 0, 0]	];;

	for (var y = 0; y < 8; y ++) {
		for (var z = 0; z < 8; z++) {
			if (new_matrix[y][z] <= filter_value) {
				new_matrix[y][z] = 0;
			}
		}
	};

	draw_circos(new_matrix);
}







