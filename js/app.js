/*
 * Useful example: http://jbkflex.wordpress.com/2011/07/28/creating-a-svg-pie-chart-html5/
 */

window.onload = function() {

	var chartData = [
		{'amount': 113, 'title': 'Car'},
		{'amount': 100, 'title': 'Food'},
		{'amount': 50, 'title': 'Other'},
		{'amount': 28, 'title': 'Clothes'},
		{'amount': 27, 'title': 'Entertainment'}
	];
	var $chart = document.getElementById('chart');

	var pChart = new PieChart();

	var radius = $chart.offsetWidth / 2 - $chart.offsetWidth * 0.1;

	pChart.setBaseSettings({
		baseX: $chart.offsetWidth / 2,
		baseY: $chart.offsetWidth / 2,
		pieRadius: radius,
		donutInnerRadius: radius * 0.43
	});
	pChart.init( '#chart', chartData );

};


function PieChart() {

	var self = this;

	var Chart = null;

	/*
	 * Array of objects, each one contain information about the sector:
	 * data - raw data from the client
	 * angle - angle of each sector
	 */
	var pieData = [];

	/*-------- Basic Settings --------*/
	var pieRadius = 180;
	var baseX = 300;
	var baseY = 200;
	var donutInnerRadius = 0;

	var donutChildren = {
		title: null,
		amount: null
	};

	var colors = ["#468966","#FFF0A5","#FFB03B","#B64926","#8E2800"];

	/**
	 * Rewriting base settings
	 * @param newSettings (Object)
	 * @return
	 *      true - data added
	 *      false - error occurred
	 */
	this.setBaseSettings = function( newSettings ){
		if ( newSettings == null || typeof newSettings !== 'object' ) {
			console.warn('%cnewSettings should be an Object', 'font-weight: 700');
			return false;
		}
		pieRadius = newSettings.hasOwnProperty( 'pieRadius' ) ? newSettings.pieRadius : pieRadius;
		baseX = newSettings.hasOwnProperty( 'baseX' ) ? newSettings.baseX : baseX;
		baseY = newSettings.hasOwnProperty( 'baseY' ) ? newSettings.baseY : baseY;
		donutInnerRadius = newSettings.hasOwnProperty( 'donutInnerRadius' ) ? newSettings.donutInnerRadius : donutInnerRadius;
		return true;
	};

	/**
	 * Set new pie data
	 * @param newData (Array)
	 * @return
	 *      true - data added
	 *      false - error occurred
	 */
	this.setPieData = function( newData ){
		var total = 0;

		// Error handler
		if ( ! (newData instanceof Array) ) {
			console.error('%cchartData should be an Array', 'font-weight: 700');
			return false;
		}

		// Calculating total amount of given data
		for (var i=0; i<newData.length; i++) total += newData[i].amount;

		for (var j=0; j<newData.length; j++) {
			pieData.push({
				sectorID: null,
				amount: newData[j].amount,
				angle: 360 * newData[j].amount/total,
				color: colors[j],
				title: newData[j].title,
				scale: 1
			});
		}

		return true;
	};

	/**
	 * Drawing pie
	 */
	this.drawPie = function(){
		var startAngle = endAngle = 0; // startAngle & endAngle are in degrees
		var x1,x2,y1,y2 = 0;
		var startX, startY;
		var pathStr, sector;
		var donutInnerCircle, shadow, clipShadow;

		for(var i=0, l=pieData.length; i<l; i++){
			startAngle = endAngle;
			endAngle = startAngle + pieData[i].angle;

			x1 = parseInt(baseX + pieRadius*Math.cos(Math.PI*startAngle/180));
			y1 = parseInt(baseY + pieRadius*Math.sin(Math.PI*startAngle/180));

			x2 = parseInt(baseX + pieRadius*Math.cos(Math.PI*endAngle/180));
			y2 = parseInt(baseY + pieRadius*Math.sin(Math.PI*endAngle/180));

			/*
			 * Solving problem of not fitting the last sector with the first one
			 * This problem cases by number rounding, and the easiest way to solve it - is to use the same coordinates for the last point as for the first one
			 */
			if ( i == 0 ) {
				startX = x1; startY = y1;
			} else if ( i == l-1 ) {
				x2 = startX; y2 = startY;
			}

			pathStr = 'M'+ baseX +','+ baseY +'  L'+ x1 +','+ y1 +'  A'+ pieRadius +','+ pieRadius +' 0 0,1 ' + x2 + ',' + y2 + ' z'; //1 means clockwise

			sector = Chart.path( pathStr );
			sector
				.attr('fill',pieData[i].color)
				.addClass('pie-sector')
				.click( sectorClick );

			// Save id of new sector for later reference
			pieData[i].sectorID = sector.id;
		}

		/*
		 * If there is property of donutInnerRadius > 0 then creating inner circle
		 */
		if ( donutInnerRadius ) {
			donutInnerCircle = Chart.circle(baseX, baseY, donutInnerRadius);
			donutInnerCircle.attr('fill', '#bbb');

			/*
			 * Creating shadow for inner part.
			 * Pay attention that shadow is actually donutInnerCircle
			 * shadow & clipShadow are masked together and placing on top of donutInnerCircle
			 */
			shadow = Chart.circle(baseX, baseY, donutInnerRadius);
			shadow.attr('fill', '#fff');

			clipShadow = Chart.circle(baseX + 2, baseY + 2, donutInnerRadius);
			clipShadow.attr('fill', '#fff');

			shadow.attr('mask', clipShadow);
		}

	};

	/**
	 * Sector click handler
	 */
	function sectorClick() {
		/*
		 * Creating new matrix
		 * @example http://svg.dabbles.info/snaptut-matrix.html
		 */
		var newMatrix = new Snap.Matrix();
		var pieSector = getPieDataByID( this.id );
		var scaleVar = 1.2;
		var id = this.id;

		if ( pieSector && pieSector.scale == 1 ) {
			newMatrix.scale(scaleVar, scaleVar, baseX, baseY);
			pieDataProperty( this.id, 'scale', scaleVar );

			/*
			 * Closing other sectors
			 */
			var closeMatrix = new Snap.Matrix();
			closeMatrix.scale(1, 1, baseX, baseY);

			Snap.selectAll('.pie-sector').forEach(function( sector ){
				if ( sector.id !== id && pieDataProperty( sector.id, 'scale', undefined ) !== 1  ) {
					sector.animate({ transform: closeMatrix }, 500, mina.bounce);
					pieDataProperty( sector.id, 'scale', 1 );
				}
			});
		} else {
			newMatrix.scale(1, 1, baseX, baseY);
			pieDataProperty( id, 'scale', 1 );
		}

		this.animate({ transform: newMatrix }, 500, mina.bounce);

		drawDonutText( pieSector.title, pieSector.amount );
	}

	/**
	 * Return pieData by it's ID
	 * @param sID - sector's ID
	 * @return
	 *      (object) - found object with given id
	 *      false - if there are no such object
	 */
	function getPieDataByID( sID ){
		for ( var i=0; i<pieData.length; i++ ) {
			if ( sID == pieData[i].sectorID ) return pieData[i];
		}
		return false;
	}

	/**
	 * Manipulating with property value of pieData
	 * @param sID
	 * @param property
	 * @param data
	 * @returns
	 *      Value of property
	 * @returns {Boolean}
	 *      true - property was set
	 *      false - error occurred (no such ID, or no such property)
	 */
	function pieDataProperty( sID, property, data ) {
		for ( var i=0; i<pieData.length; i++ ) {
			if ( sID == pieData[i].sectorID && pieData[i].hasOwnProperty( property ) ) {
				if ( data !== undefined ) {
					pieData[i][property] = data;
					return true;
				} else {
					return pieData[i][property]
				}
			}
		}
		return false;
	}

	/**
	 * Drawing text inside of donut
	 * @param title
	 * @param amount
	 */
	function drawDonutText( title, amount ) {
		var newX, newY;

		/*
		 * Creating title
		 */
		if ( ! donutChildren.title ) {
			donutChildren.title = Chart.text(baseX, baseY, title);
			donutChildren.title.addClass('title');
		} else {
			donutChildren.title.node.textContent = title;
		}

		// Placing title in the center
		newX = baseX - donutChildren.title.node.clientWidth / 2.1;
		newY = baseY - donutChildren.title.node.clientHeight;
		donutChildren.title.attr({
			'x': newX,
			'y': newY
		});


		/*
		 * Creating amount
		 */
		if ( ! donutChildren.amount ) {
			donutChildren.amount = Chart.text(baseX, baseY, amount);
			donutChildren.amount.addClass('amount');
		} else {
			donutChildren.amount.node.textContent = amount;
		}
		newX = baseX - donutChildren.amount.node.clientWidth / 2.1;
		newY = baseY + donutChildren.amount.node.clientHeight;
		donutChildren.amount.attr({
			'x': newX,
			'y': newY
		});
	}

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