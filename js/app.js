/*
 * Useful example: http://jbkflex.wordpress.com/2011/07/28/creating-a-svg-pie-chart-html5/
 */


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

	var pieRadius = 180;
	var baseX = 300;
	var baseY = 200;
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
		for (var i=0; i<newData.length; i++) total += newData[i];

		for (var j=0; j<newData.length; j++) {
			pieData.push({
				data: newData[j],
				angle: Math.round(360 * newData[j]/total),
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
		var startX, startY;

		for(var i=0, l=pieData.length; i<l; i++){
			startAngle = endAngle;
			endAngle = startAngle + pieData[i].angle;

			x1 = parseInt(baseX + pieRadius*Math.cos(Math.PI*startAngle/180));
			y1 = parseInt(baseY + pieRadius*Math.sin(Math.PI*startAngle/180));

			x2 = parseInt(baseX + pieRadius*Math.cos(Math.PI*endAngle/180));
			y2 = parseInt(baseY + pieRadius*Math.sin(Math.PI*endAngle/180));

			/*
			 * Solving problem of not fitting the last sector with the first one
			 * This problem cases by number rounding, and the easiest way to solve it is to use the same coordinates for lat point as for the first one
			 */
			if ( i == 0 ) {
				startX = x1; startY = y1;
			} else if ( i == l-1 ) {
				x2 = startX; y2 = startY;
			}

			var pathStr = 'M'+ baseX +','+ baseY +'  L' + x1 + ',' + y1 + '  A'+ pieRadius +','+ pieRadius +' 0 0,1 ' + x2 + ',' + y2 + ' z'; //1 means clockwise
			//alert(pathStr);
			arc = Chart.path( pathStr );
			arc.attr('fill',pieData[i].color);
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