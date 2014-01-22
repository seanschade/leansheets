'use strict';

angular.module('controlChartCtrl', []).
  controller('ControlChartCtrl', ['$scope', 'DataService', '$window', function($scope, DataService, $window) {
  	var directivePromise = DataService.getData('Feature');
  	directivePromise.then(function (success){
  		$scope.featureConfig = getOptionsForChart('Feature', parseData(success));
  	}, function (error) {
  		alert(error);
  	});

  	var defectsPromise = DataService.getData('Defect');
  	defectsPromise.then(function (success) {
  		$scope.defectConfig = getOptionsForChart('Defect', parseData(success));
  	}, function (error) {
  		alert(error);
  	});

	var getOptionsForChart = function (title, data) {
		return {
			options: {
				chart: {
					type: 'line'
				},
				xAxis: {
	              	title: {
	                	text: 'End Dates'
	              	},
	            	categories: data.endDates
	            },
	            yAxis: {
	            	title : {
	            		text: 'Lead Time'
	            	},
	            	plotLines: [{
		              		color: 'red',
		              		value: data.leadTimeStDevation.mean,
		              		width: 2,
		              		label: { text: 'Average Lead Time - ' + data.leadTimeStDevation.mean }
	              		}, 
	              		{
		              		color: 'green',
		              		value: data.leadTimeStDevation.high,
		              		width: 2,
		              		label: { text: 'Upper Control Limit - ' + data.leadTimeStDevation.high }
	              		},
	              		{
		              		color: 'green',
		              		value: data.leadTimeStDevation.low,
		              		width: 2,
		              		label : { text: 'Lower Control Limit - ' + data.leadTimeStDevation.low }
	              		}],
	            }
			},
			series: [{
				name: 'Lead Time',
				data: data.leadTimes
			}],
			title: {
				text: title + ' Control Chart'
			}
		}
	};

	var average = function(a) {
		var r = {mean: 0, variance: 0, deviation: 0, high: 0, low: 0}, t = a.length;
		for(var m, s = 0, l = t; l--; s += a[l]);
		for(m = r.mean = s / t, l = t, s = 0; l--; s += $window.Math.pow(a[l] - m, 2));
		r.deviation = $window.Math.sqrt(r.variance = s / t);
		r.high = $window.Math.round(r.mean + r.deviation);
		r.low = $window.Math.round(r.mean - r.deviation);
		r.mean = $window.Math.round(r.mean);
		return r;
	};

	var parseData = function (csv) {
		var data = {};
  		data.endDates = [];
  		data.leadTimes = [];

  		var lines = csv.split("\n");
  		lines = popLastIndexOfArrayIfEmpty(lines);

  		var str = "";
  		var leadTimeSum = [];
  		for (var i in lines) {
    		var line = lines[i].split(",");
    		var obj = {};
    		obj.y = parseInt(line[1]);
    		obj.name = line[2] + ' - ' + line[3];
    		data.endDates.push(line[0]);
    		data.leadTimes.push(obj);
    		leadTimeSum.push( obj.y);
  		}
  		data.leadTimeStDevation = average(leadTimeSum);
  		return data;
	};

	var popLastIndexOfArrayIfEmpty = function (arry) {
      	if (arry[arry.length] == "" || arry[arry.length] == null) {
        	arry.pop();
	  	}
  		return arry;
	};

}]);