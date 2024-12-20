forecasts = {};

placeNames = {};

showuri = false;

function placeParentsNames(uri) {
	return placeNames[uri];
}

function createObservationsTree(tree, day) {
	console.log("createObservationsTree " + tree + day)
	// Create place UUID if it do not exist
	if (placeIds[tree["placeUri"]] === undefined) {
		placeIds[tree["placeUri"]] = generateID();
	}
	id = placeIds[tree["placeUri"]];

	if ($("#" + id).length == 0) {
		// Live observations
		$("#graph").append("<div class='tab-pane fade' id='" + id + "' role='tabpanel' aria-labelledby='" + id + "-tab'></div>");
	}

	$('#tree').empty();
	$("#tree").append("<div class='nav flex-column nav-pills' id='v-pills-tab' role='tablist' aria-orientation='vertical'/>");
	if (showuri) $("#v-pills-tab").append("<a class='nav-link' id='" + id + "-tab' data-toggle='pill' href='#" + id + "' role='tab' aria-controls='" + id + "' aria-selected='false'>" + tree["placeName"] + ' '+tree["placeUri"] +"</a>");
	else $("#v-pills-tab").append("<a class='nav-link' id='" + id + "-tab' data-toggle='pill' href='#" + id + "' role='tab' aria-controls='" + id + "' aria-selected='false'>" + tree["placeName"] +"</a>");

	forecasts[id + "-tab"] = {};
	forecasts[id + "-tab"]["uri"] = tree["placeUri"];
	forecasts[id + "-tab"]["name"] = tree["placeName"];

	if($('#'+id).length == 0) addPlace(id);

	$('#' + id + '-tab').on('show.bs.tab', function(e) {
		paneid = e.target.id.substring(0, e.target.id.length - 4)

		if ($("#" + paneid).length != 0) {
			console.log("show exists: " + paneid)
		}
		else {
			console.log("show NOT exists: " + paneid)
			addPlace(paneid)
			$('#' + e.target.id).tab('show')
		}
	});
	
	$('#' + id + '-tab').on('shown.bs.tab', function(e) {
		console.log("shown " + e.target.id)
		// FORECAST
		console.log("Query forecasts. URI: " + forecasts[e.target.id].uri + " Name: " + forecasts[e.target.id].name + " day: " + day.toISOString())
		queryForecast(forecasts[e.target.id].uri, e.target.id, forecasts[e.target.id].name, day)
	});
	
	$('#' + id + '-tab').on('hide.bs.tab', function(e) {
		console.log("hide " + e.target.id)

	});
	
	$('#' + id + '-tab').on('hidden.bs.tab', function(e) {
		console.log("hidden " + e.target.id)

	});

	$("#" + id + "-tab").tab('show');

	placeNames = {};
	placeNames[tree["placeUri"]] = [];
	placeNames[tree["placeUri"]].push(tree["placeName"]);

	$("input[placeId='" + id + "']").val(escape(tree["placeName"]))

	createTree(tree["childs"], id + "-tab", 1, placeNames[tree["placeUri"]], day);
}

function createTree(childs, parentId, n, names, day) {
	console.log("createTree " + childs + parentId + n + names + day)
	for (child of childs) {
		if (placeIds[child["placeUri"]] === undefined) {
			placeIds[child["placeUri"]] = generateID();
		}
		id = placeIds[child["placeUri"]];

		childName = child["placeName"];
		for (i = 0; i < n; i++) { childName = "&nbsp&nbsp&nbsp&nbsp" + childName };

		if (showuri) $("#v-pills-tab").append("<a class='nav-link' id='" + id + "-tab' data-toggle='pill' href='#" + id + "' role='tab' aria-controls='" + id + "' aria-selected='false'>" + childName + ' ' + child["placeUri"] + "</a>");
		else $("#v-pills-tab").append("<a class='nav-link' id='" + id + "-tab' data-toggle='pill' href='#" + id + "' role='tab' aria-controls='" + id + "' aria-selected='false'>" + childName + "</a>");
		
		$("#" + id + "-tab").insertAfter("#" + parentId);

		$('#' + id + '-tab').on('show.bs.tab', function(e) {
			paneid = e.target.id.substring(0, e.target.id.length - 4)

			if ($("#" + paneid).length != 0) {
				console.log("show exists: " + paneid)
			}
			else {
				console.log("show NOT exists: " + paneid)
				addPlace(paneid)
				$('#' + e.target.id).tab('show')
			}
		});
		
		if($('#'+id).length == 0) addPlace(id);
		
		$('#' + id + '-tab').on('shown.bs.tab', function(e) {
			console.log("shown " + e.target.id)
			// FORECAST
			console.log("Query forecasts. URI: " + forecasts[e.target.id].uri + " Name: " + forecasts[e.target.id].name + " day: " + day.toISOString())
			queryForecast(forecasts[e.target.id].uri, e.target.id, forecasts[e.target.id].name, day)
		});
		
		$('#' + id + '-tab').on('hide.bs.tab', function(e) {
			console.log("hide " + e.target.id)

		});
		
		$('#' + id + '-tab').on('hidden.bs.tab', function(e) {
			console.log("hidden " + e.target.id)

		});

		forecasts[id + "-tab"] = {};
		forecasts[id + "-tab"]["uri"] = child["placeUri"];
		forecasts[id + "-tab"]["name"] = child["placeName"];

		placeNames[child["placeUri"]] = [];
		for (x of names) placeNames[child["placeUri"]].push(x);
		placeNames[child["placeUri"]].push(child["placeName"]);

		name = "";
		for (x of placeNames[child["placeUri"]]) {
			if (name == "") name = x;
			else name = name + " - " + x;
		}
		$("input[placeId='" + id + "']").val(escape(name));

		createTree(child["childs"], id + "-tab", n + 1, placeNames[child["placeUri"]], day);
	}
}