var placeIds = {};
var markers = {};
var map;
var icons = {};

var initPos = {
	"swamp": {
		"lat": 44.781,
		"lng": 10.717520,
		"zoom": 12
	},
	"default": {
		"lat": 44.50265,
		"lng": 11.3701,
		"zoom": 18
	},
	"arces": {
		"lat": 44.4948,
		"lng": 11.3425,
		"zoom": 15
	}
}

function initMap(context) {
	if (initPos[context] != undefined) {
		map = L.map('mapid').setView([initPos[context]["lat"], initPos[context]["lng"]], initPos[context]["zoom"]);
	}
	else {
		map = L.map('mapid').setView([initPos["default"]["lat"], initPos["default"]["lng"]], initPos["default"]["zoom"]);
	}


	//	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	//	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	//	    maxZoom: 18,
	//	    id: 'mapbox.streets',
	//	    accessToken: 'pk.eyJ1IjoibHJvZmZpYSIsImEiOiJjanhiZjVxemkwYzZlM3pvODZjcGJlYjdtIn0.cD3reeNMoDGpiRBDTHn5_w'
	//	}).addTo(map);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1,
		accessToken: 'pk.eyJ1IjoibHJvZmZpYSIsImEiOiJjanhiZjVxemkwYzZlM3pvODZjcGJlYjdtIn0.cD3reeNMoDGpiRBDTHn5_w'
	}).addTo(map);

	// Init markers
	initMarkers();

	// Crop list box
	queryCrops().then((crops) => {
		n = 0;
		for (crop in crops) {
			$('#filterByCrop').append('<option value="' + crops[crop] + '">' + crop + '</option>');
			n++;
		}

		updateCropsCount(n);
	});

	// Canals
	canals = initCanals();
	for (canal of canals) L.polyline(canal["vertexes"], { color: canal["color"] }).addTo(map);

	// Fields
	initFields().then((fields) => {
		mapFields = fields;
		geoJson = undefined;
		showFields("ALL");
	});

	// Requests
	queryIrrigationRequestsCount().then((n) => {
		updateIrrigationRequestsCount(n);
	})
}

function showFields(crop) {
	cropFilter = crop;

	if (geoJson != undefined) geoJson.removeFrom(map);

	fieldsCount = 0;

	geoJson = L.geoJSON(mapFields, {
		style: function(feature) {
			return { color: feature.properties.color };
		},
		onEachFeature: onEachFeature,
		filter: onFilter
	});

	geoJson.addTo(map);

	updateFieldsCount(fieldsCount);
}

function onFilter(feature) {
	if (cropFilter == "ALL" || feature.properties.crop == cropFilter) {
		fieldsCount++;
		return true;
	}
	return false;
}

function onAddedMapPlace(places) {
	for (binding of places) {
		place = binding.root.value;
		name = binding.name.value;
		lat = parseFloat(binding.lat.value.replace(",", "."));
		lng = parseFloat(binding.long.value.replace(",", "."));

		add_marker(lat, lng, name, place);
	}
}

function onRemovedMapPlace(removedResults) {
	for (binding of places) {
		binding = removedResults.results.bindings[index];

		place = binding.root.value;

		remove_marker(place);
	}
}

function initMarkers() {
	var swamp = L.icon({
		iconUrl: 'icon/swamp.png',
		iconSize: [48, 48]
	});

	var server = L.icon({
		iconUrl: 'icon/server.png',
		iconSize: [48, 48]
	});

	var wheel = L.icon({
		iconUrl: 'icon/wheel.png',
		iconSize: [24, 24]
	});

	var weir = L.icon({
		iconUrl: 'icon/weir.png',
		iconSize: [36, 36]
	});

	var cp = L.icon({
		iconUrl: 'icon/weirwheel.png',
		iconSize: [36, 36]
	});

	var sepa = L.icon({
		iconUrl: 'icon/sepa-logo.svg',
		iconSize: [300, 300]
	});

	var cbec = L.icon({
		iconUrl: 'icon/cbec.png',
		iconSize: [36, 36]
	});

	var rain = L.icon({
		iconUrl: 'icon/rain4.png',
		iconSize: [36, 36]
	});

	var lorawan = L.icon({
		iconUrl: 'icon/lorawan.png',
		iconSize: [72, 36]
	});

	icons["http://swamp-project.org/ns#Bertacchini"] = swamp;
	icons["http://swamp-project.org/ns#Ferrari"] = swamp;
	icons["http://swamp-project.org/ns#Bonacini"] = swamp;
	icons["http://swamp-project.org/ns#Guaspari"] = swamp;

	icons["http://wot.arces.unibo.it/monitor#Star"] = server;
	icons["http://wot.arces.unibo.it/monitor#Mars"] = server;

	// icons["http://wot.arces.unibo.it/monitor#ParatoiaSanMichele"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#SanMichele"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#DiramazioneSanMichele"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#FosdondoSud"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#FosdondoNord"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#CanaleSanMichele"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#FosdondoDirezioneSud"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#DiramazioneFosdono"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#SbarramentoFosdondo"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#ScaricoCanaleFosdondo"] = wheel;
	icons["http://wot.arces.unibo.it/monitor#ValleSbarramentoFosdondoDirNord"] = wheel;

	icons["http://swamp-project.org/ns#Gate1"] = weir;
	icons["http://swamp-project.org/ns#Gate2"] = weir;
	icons["http://swamp-project.org/ns#Gate3"] = weir;
	icons["http://swamp-project.org/ns#Gate4M"] = weir;
	icons["http://swamp-project.org/ns#Gate4V"] = weir;
	icons["http://swamp-project.org/ns#Gate5"] = weir;
	icons["http://swamp-project.org/ns#Gate6"] = weir;
	icons["http://swamp-project.org/ns#Gate7"] = weir;

	icons["http://swamp-project.org/ns#CP1"] = cp;
	icons["http://swamp-project.org/ns#CP2"] = cp;
	icons["http://swamp-project.org/ns#CP3"] = cp;

	icons["http://swamp-project.org/context/Place/CBEC"] = cbec;

	icons["http://sepa/test/place"] = sepa;

	icons["http://wot.arces.unibo.it/monitor#PluviometroCorreggio"] = rain;
	icons["http://wot.arces.unibo.it/monitor#PluviometroRotte"] = rain;
	icons["http://wot.arces.unibo.it/monitor#PluviometroSantaMaria"] = rain;

	icons["http://wot.arces.unibo.it/monitor#LepidaLoRaWANBagnarolo"] = lorawan;
	icons["http://wot.arces.unibo.it/monitor#LepidaLoRaWANCadelbosco"] = lorawan;
	icons["http://wot.arces.unibo.it/monitor#LepidaLoRaWANNovellara"] = lorawan;
	icons["http://wot.arces.unibo.it/monitor#LepidaLoRaWANCastelnuovo"] = lorawan;
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: function() {
			this.setStyle({
				'fillColor': '#b45501',
			});
		},
		mouseout: function() {
			this.setStyle({
				'fillColor': feature.properties.color,
			});
		},
		click: function() {
			queryIrrigationRequests(feature.properties.field).then((info) => {
				showIrrigationInfoBox(feature,info);
			});
		}
	});
	layer.bindTooltip(feature.properties.field, { permanent: false, direction: 'center' });
}

function buildInfoRow(info) {
	var col1 = document.createElement("div");
	col1.setAttribute("class", "col");
	col1.innerHTML = info[0];

	var col2 = document.createElement("div");
	col2.setAttribute("class", "col");
	col2.innerHTML = info[1];

	var col3 = document.createElement("div");
	col3.setAttribute("class", "col");
	col3.innerHTML = info[2];

	var row = document.createElement("div");
	row.setAttribute("class", "row");
	row.appendChild(col1);
	row.appendChild(col2);
	row.appendChild(col3);
	
	return row;
}
function showIrrigationInfoBox(feature, info) {
	$('#irrigationRequestsInfoBoxBody').empty();

	$('#irrigationRequestsInfoBoxBody').append('<div class="row mb-3"><div class="col-auto">Field URI</div><div class="col-auto">' + feature.properties.field + "</div></div>");
	$('#irrigationRequestsInfoBoxBody').append('<div class="row mb-3"><div class="col-auto">Crop URI</div><div class="col-auto">' + feature.properties.crop + " (" + feature.properties.cropLabel + ")</div></div>");
	$('#irrigationRequestsInfoBoxBody').append('<div class="row mb-3"><div class="col-auto">Canal URI</div><div class="col-auto">' + feature.properties.canal + "</div></div>");

	document.getElementById("irrigationRequestsInfoBoxBody").appendChild(buildInfoRow(["Request #","Scheduled","Satisfied"]));

	for (irr of info) document.getElementById("irrigationRequestsInfoBoxBody").appendChild(buildInfoRow([irr["reservationNumber"],irr["scheduled"],irr["satisfied"]]));

	$('#irrigationRequestsInfoBox').modal('show');
}


function add_marker(lat, lng, name, id) {
	if (placeIds[id] === undefined) placeIds[id] = generateID();

	if (icons[id] != undefined) {
		var marker = L.marker([lat, lng], { "title": name, "icon": icons[id] }).addTo(map);
	}
	else {
		var marker = L.marker([lat, lng], { "title": name, }).addTo(map);
	}

	markers[id] = {};
	markers[id]["name"] = name;
	markers[id]["uri"] = id;
	markers[id]["marker"] = marker;

	markers[id]["marker"].on('click', function() {
		onMapPlaceClick(id, name, lat, lng)
	});
}

function remove_marker(id) {
	markers[id].marker.removeFrom(map);

	delete placeIds[markers[id].uri];

	delete markers[id];
}