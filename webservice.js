// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const webservice = 'https://jcws.herokuapp.com/';

function computeName(mol) {
	return fetch(webservice + 'util/calculate/stringMolExport', {
		method: 'POST',
		headers: {
			'user-agent': 'PacDraw',
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			structure: mol,
			parameters: 'name'
		})
	})
		.then(res => res.text())
		.catch(error => console.error('Error computing name:', error));
}

// Warm-up
computeName('C').then((name) => console.log('IUPAC name of CH4:', name));
