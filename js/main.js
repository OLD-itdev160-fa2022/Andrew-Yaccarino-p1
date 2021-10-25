let normalized_zones = [];
let displayed_alerts = [];
let id_target = 0;

window.onload = function() {
	let parent = document.getElementById('trails');
	createTable(trails, parent, 5); // add ability for variable size
	normalizeZones();
	getWeatherForTrails();
}

function createTable(data, parent, columns) {
	let table = NEWELEMENT('table', parent);
	
	let rows = Math.ceil(data.length / columns);
	
	let number_to_display = data.length;
	for (let i = 0; i < rows; i++) {
		let row = table.insertRow();
		for (let j = 0; j < columns && number_to_display > 0; j++) {
			let col = row.insertCell();
			
			let cell_data = data[columns * i + j];
			
			col.setAttribute('id',cell_data.id);
			addTrail(cell_data, col);
			number_to_display--;
		}
	}
}


function normalizeZones() {
	for (let trail of trails) {
		for (let zone of trail.zones) {
			if (!normalized_zones.includes(zone)) {
				normalized_zones.push(zone);
			}
		}
	}
}

function getWeatherForTrails() {
	for (let zone of normalized_zones) {
		loadJSON('https://api.weather.gov/alerts/active/zone/WIZ'+zone, warnings);
		//loadJSON('https://api.weather.gov/zones/forecast/WIZ'+zone+'/observations', observation); // add later?
	}
}

function observation(data) {
	/**
     *  <dialog>
     *    <h1 centered red bold> [headline] </h1>
     *    <p centered> [description] </p>
     *  </dialog>
     */
	id_target++;
	let parent = document.getElementById(id_target);
	if (typeof data.features[0] == 'undefined') return;
	console.log(data);
	let averageTemp = 0;
	for (let data_points of data.features) {
		averageTemp += data_points.properties.temperature.value || 0;
	}
	averageTemp /= data.features.length;
	console.log(averageTemp);
}

function warnings(data) {
	/**
     *  <dialog>
     *    <h1 centered red bold> [headline] </h1>
     *    <p centered> [description] </p>
     *  </dialog>
     */
	let parent = document.getElementById('alerts');
	if (typeof data.features[0] == 'undefined') return;
	for (let warning of data.features) {
		let cached_data = warning.properties.id;
		if (displayed_alerts.includes(cached_data)) continue;
		displayed_alerts.push(cached_data);
		let dia = NEWELEMENT('li', parent);
		dia.innerHTML = warning.properties.headline + ' | ' + warning.properties.areaDesc;
	}
}

function addTrail(data, parent) {
	/**
	 *  <a href="[source]" id="[name]" center>
	 *    <div>
	 *      <h1> [name] </h1>
     *      <figure>
	 *          <img href="[img]"/>
     *          <figcaption>Image Source: [source title]</figcaption>
     *      </figure>
	 *    </div>
	 *  </a>
	 */
	let div = NEWELEMENT('div', parent);
	div.setAttribute('id',data.name);
	let link = NEWELEMENT('a', div);
	if (data.link != null) link.setAttribute('href',data.link);
	let h1 = NEWELEMENT('h2', link);
	h1.innerHTML = data.name;
	let link2 = NEWELEMENT('a',div);
	if (data.img_source != null) link2.setAttribute('href',data.img_source);
    let fig = NEWELEMENT('figure', link2);
	let img = NEWELEMENT('img', fig);
	img.setAttribute('src',data.img);
    let source = NEWELEMENT('figcaption', fig);
    source.innerHTML = 'Image Source: ' + data.img_source_title;
}

function NEWELEMENT(tag, parent) {
	parent = parent || document.body;
	let element = document.createElement(tag);
	parent.appendChild(element);
	return element;
}

function parseTrails(data, parent) {
	for (let trail of data) {
		addTrail(trail, parent);
	}
}

window.onerror = function() {

};

function loadJSON(path, callback_func, err_callback) {
	if (typeof window.Request !== 'function') {
		alert("The request API isn't supported on this browser yet.");
		return;
	}
	if (typeof window.fetch !== 'function') {
		alert("The fetch API isn't supported on this browser yet.");
		return;
	}

	let request = new Request(path, {method: 'GET', mode: 'cors', headers: new Headers()});
	promise = fetch(request);
	promise = promise.then(res => {
		if (!res.ok) {
			const err = new Error(res.body);
			err.status = res.status;
			err.ok = false;
			throw err;
		} else {
			return res.json();
		}
	});
	promise.then(callback_func || (() => {}));
	promise.catch(err_callback || console.error);
	return promise;
}