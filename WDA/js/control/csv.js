var csvData;
var csvContent;

var dailyValues = [];
var lastDay;
var aggregatedCsvData;

var lastObj;

function clearCSVData() {
	csvData = [];
}

function addCSVData(timestamp, value) {
	csvData.push({ "timestamp" : timestamp, "value" : value });
}

function downloadCSV(name,pre) {
	if (pre != undefined) {
		if (pre === 'daily') {
			csvContent = "timestamp,min,avg,max,sum,samples,flag\n"
			
			// Sort
			csvData.sort(sortByTimestamp);
			
			// Aggregate
			lastDay = undefined;
			aggregatedCsvData = [];
			csvData.forEach(function f(obj) {aggregateDailyData(obj)});
			addAggregatedData();
			
			// Fill missing data
			lastObj = undefined;
			csvData = [];
			aggregatedCsvData.forEach(function f(obj) {fillMissingData(obj)});	
			
			csvData.sort(sortByTimestamp);
			
			csvData.forEach(function f(obj) {buildCSVAggregateRow(obj)});
		}
	}
	else {
		csvContent = "timestamp,value\n"
		csvData.forEach(function f(obj) {buildCSVRawRow(obj)});	
	}

	var encodedUri = name.text.split(' ').join('_');
		
	var blob = new Blob([csvContent], { type: "text/plain;charset=utf-8" });
	
	saveAs(blob, encodedUri+`.csv`);
}

function addAggregatedData() {
	if (dailyValues.length == 0) return;
	
	max = Math.max.apply(null, dailyValues);
	min = Math.min.apply(null, dailyValues);
	const reduced = (accumulator, currentValue) => accumulator + currentValue;
	sum = dailyValues.reduce(reduced);
	avg = sum/dailyValues.length;

	// Rounding
	if (max.toString().includes(".")) {
		ndec = max.toString().split('.')[1].length;
		
		sum = Math.round((sum + Number.EPSILON) * 10 * ndec) / (10 * ndec)
		avg = Math.round((avg + Number.EPSILON) * 10 * ndec) / (10 * ndec)
	}

	
	aggregatedCsvData.push({ "timestamp" : lastDay.format('YYYY-MM-DD'), "max" : max , "min" : min , "sum" : sum , "avg" : avg , "samples" : dailyValues.length, "flag" : 1});	
}

function onNewDate(obj) {
	dailyValues = [];
	lastDay = moment(obj.timestamp.split('T')[0]);
	dailyValues.push(obj.value);	
}

function aggregateDailyData(obj) {
	if (lastDay === undefined) {		
		onNewDate(obj);
	} else {
		if (lastDay.dayOfYear() === moment(obj.timestamp.split('T')[0]).dayOfYear() ) {
			dailyValues.push(obj.value);				
		}
		else {
			addAggregatedData();
			onNewDate(obj);	
		}
	}
}

function fillMissingData(obj) {
	if (lastObj === undefined) {
		lastObj = obj;
		csvData.push(obj);
	} else {
		last = moment(lastObj.timestamp);
		now = moment(obj.timestamp);
		if (now.dayOfYear() - last.dayOfYear() > 1) {
			missing = last;
			missing.add(1, 'days');
			while(missing.dayOfYear() < now.dayOfYear()) {
				csvData.push({ "timestamp" : missing.format('YYYY-MM-DD'), "max" : lastObj.max , "min" : lastObj.min , "sum" : lastObj.sum , "avg" : lastObj.avg , "samples" : lastObj.samples, "flag" : 0});
				missing.add(1, 'days');
			}
		}
		
		lastObj = obj;
		csvData.push(obj);
	}	
}

function buildCSVAggregateRow(obj) {
	csvContent += obj.timestamp + "," + obj.min + "," + obj.avg + "," + obj.max + "," + obj.sum + "," + obj.samples + ","+ obj.flag + "\r\n";	
}


function buildCSVRawRow(obj) {
	csvContent += obj.timestamp + "," + obj.value + "\r\n";	
}

function sortByTimestamp( a, b ) {
  if ( a.timestamp < b.timestamp ){
    return -1;
  }
  if ( a.timestamp > b.timestamp ){
    return 1;
  }
  return 0;
}




//function downloadCSV() {
//	for (const index in selection) {
//		if (selection.hasOwnProperty(index)) {
//			let dates = traces[index].x.map(date => date.toUTCString())
//			let csvData = zip(dates, traces[index].y)
//
//			let csvContent = "timestamp,data\n";
//
//			csvData.forEach(function (rowArray) {
//				let row = rowArray.join(",");
//				csvContent += row + "\r\n";
//			});
//			var blob = new Blob([csvContent], { type: "text/plain;charset=utf-8" });
//			saveAs(blob, `${selection[index].text}.csv`);
//			
//		}
//	}
//}
//
///*
// * Utility zip function
// */
//function zip(arr, ...arrs)  {
//return arr.map((val, i) => arrs.reduce((a, arr) => [...a, arr[i]], [val]));
//}