$(document).ready(function(){

	var pChart = new PieChart();
	var chartData = [113,100,50,28,27];

	pChart.init( '#chart', chartData );

});


function PieChart() {

	var self = this;

	var Chart = null;

	/*
	 * Array of objects, each one contain information about the sector:
	 * data - raw data from the client
	 * angle - angle of each sector
	 */
	var pieData = [];

	var radius = 50;
	var colors = ["#468966","#FFF0A5","#FFB03B","#B64926","#8E2800"];

	/**
	 * Set new pie data
	 * @param newData (Array)
	 * @return
	 *      true - data added
	 *      false - error occured
	 */
	this.setPieData = function( newData ){
		var total = 0;

		// Error handler
		if ( ! (newData instanceof Array) ) {
			console.error('%cchartData should be an Array', 'font-weight: 700');
			return false;
		}

		// Calculating total amount of given data
		for (var i=0, l=newData.length; i<l; i++) total += newData[i];

		for (var j=0; j<l; j++) {
			pieData.push({
				data: newData[j],
				angle: Math.ceil(360 * newData[j]/total),
				color: colors[j]
			});
		}

		return true;
	};

	/**
	 * Drawing pie
	 */
	this.drawPie = function(){
		var startAngle = 0;
		var endAngle = 0;
		var x1,x2,y1,y2 = 0;

		for(var i=0, l=pieData.length; i<l; i++){
			startAngle = endAngle;
			endAngle = startAngle + pieData[i].angle;

			x1 = parseInt(200 + 180*Math.cos(Math.PI*startAngle/180));
			y1 = parseInt(200 + 180*Math.sin(Math.PI*startAngle/180));

			x2 = parseInt(200 + 180*Math.cos(Math.PI*endAngle/180));
			y2 = parseInt(200 + 180*Math.sin(Math.PI*endAngle/180));

			var pathStr = "M200,200  L" + x1 + "," + y1 + "  A180,180 0 0,1 " + x2 + "," + y2 + " z"; //1 means clockwise
			//alert(d);
			arc = Chart.path( pathStr );
			arc.attr("fill",pieData[i].color);
		}
	};

	/**
	 * Pie Chart initialisation
	 * @param chartElemID
	 * @param chartData (Array)
	 */
	this.init = function( chartElemID, chartData ) {
		Chart = Snap( chartElemID );
		if ( ! self.setPieData( chartData ) ) return false;
		self.drawPie();
	}
}