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

function computeProperties(mol) {
	return fetch(webservice + 'util/detail', {
		method: 'POST',
		headers: {
			'user-agent': 'PacDraw',
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			structures: [
				{ structure: mol }
			],
			display: {
				include: [ "elementalAnalysis", "hbda", "solubility" ],
				additionalFields: {
					logp: "chemicalTerms(logp)"
				},
			}
		})
	})
		.then(res => res.json())
		.then(json => json.data[0])
		.catch(error => console.error('Error computing properties:', error));
}

// Warm-up
computeName('C').then((name) => console.log('IUPAC name of CH4:', name));
computeProperties('c1ccccc1').then(properties => console.log('Properties of benzene:', properties));
