class GPSViewer {
	 /**
     * constructor description
     * @GeoJSONPath  {[string]} Path to GeoJSON to be visualized
	 * @totalMiles {[int]} Maximum value of keyframes in document. For example, if totalMiles = 10, something with id="2" in the HTML will be plotted 20% through the GeoJSON file.
     */
	constructor(GeoJSONPath, totalMiles) {
		this.GeoJSONPath = GeoJSONPath;
		this.latLongs = [];
		this.totalMiles = totalMiles;
		this.keyframes = [];
		this.projection = d3.geoMercator();
	}

	loadGPX() {
		var divSize = d3.select("div#map").node().getBoundingClientRect();
		
		var svg = d3.select("div#map")
  			.append("svg")
			.attr("id", "gpsTrack")
  			.attr("width",divSize.width*0.95)
  			.attr("height",divSize.height*0.95);
				
		var path = d3.geoPath().projection(this.projection);
		
		d3.json(this.GeoJSONPath, (err, geojson) => { 
	  		this.projection.fitSize([divSize.width*0.9,divSize.width*0.9],geojson);
  			this.latLongs = geojson.features[0].geometry.coordinates[0];
	
			svg.append("path")
				.attr("class", "trackpath")
				.attr("d", path(geojson))
				.attr("fill", "none")
				.attr("stroke", "rgb(222,45,38)")
				.attr("stroke-width", 1);
			svg.append("circle")
				.attr("class", "track")
				.attr("id", "location")
				.attr("r", 4)
				.attr("transform", (d) => {
					return "translate(" + this.projection(this.latLongs[0]) + ")"})
				.style("fill", "rgb(9,185,224)")
				.style("stroke-width", 1)
				.style("stroke", "rgb(0,0,0)");
			});
	};
	
	movePoint() {	
		var scrollMaxY = window.scrollMaxY || (document.documentElement.scrollHeight - document.documentElement.clientHeight)
		var scrollPercentage = Math.min(1, Math.max((window.scrollY / scrollMaxY), 0));
		var adjustedScrollY = window.scrollY + scrollPercentage*window.innerHeight;
		var trackPercentage = this.interpolateMiles(adjustedScrollY) / this.totalMiles;
		d3.select("circle#location")
			.attr("transform", (d) => {
				return "translate(" + this.projection(this.latLongs[Math.floor(trackPercentage * this.latLongs.length)]) + ")"
		});
	
	};
	
	calculateKeyframes() {
		var keyframes = [];
		keyframes.push([0,0]);
		d3.selectAll(".keyframe").each(function() {
			keyframes.push([this.getBoundingClientRect().top, parseFloat(this.id)]);
		});
		keyframes.push([Number.MAX_VALUE, this.totalMiles])
		this.keyframes = keyframes;
	};
	
	interpolateMiles(scrollVal) {
		if (scrollVal <= 0) {
			return 0;
		}
		var i;
		for(i = 0; this.keyframes[i][0] < scrollVal; i++) {}
		var percentageInRange = (scrollVal - this.keyframes[i-1][0])/(this.keyframes[i][0] - this.keyframes[i-1][0])
		return (percentageInRange * (this.keyframes[i][1] - this.keyframes[i-1][1])) + this.keyframes[i-1][1]
	};	
}