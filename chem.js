// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

let atoms = {};
let bonds = {};

let id = 0;

function addBond(x, y, dx, dy, type) {
	const source = getAtom(x, y);
	const dest = getAtom(x + dx, y + dy);
	const b = getBond(source, dest, type);
}

function getAtom(x, y) {
	const key = x + ',' + y;
	let res;
	if (key in atoms)
		res = atoms[key];
	else {
		res = { id: id++, x: x, y: y, atno: 6, symbol: 'C' };
		atoms[key] = res;
	}
	return res;
}

function getBond(a1, a2, type) {
	if (a1.id < a2.id) {
		const tmp = a1;
		a1 = a2;
		a2 = tmp;
	}
	let key = a1.id + '-' + a2.id;
	let res;
	if (key in bonds) {
		res = bonds[key];
		res.type = type;
	}
	else {
		res = { id: id++, a1: a1.id, a2: a2.id, type: type };
		bonds[key] = res;
	}
	return res;
}

function getIUPACName() {
	return computeName(getMolecule());
}

function getMolecule() {
	let atomIDs = '';
	let elementTypes = '';
	let bondArray = '';

	for (const id in atoms) {
		atomIDs += atoms[id].id + ' ';
		elementTypes += atoms[id].symbol + ' ';
	}

	for (const id in bonds) {
		const b = bonds[id];
		bondArray += `\n<bond id="${b.id}" atomRefs2="${b.a1} ${b.a2}" order="${b.type}"/>`;
	}
	
	let mol = `<?xml version="1.0" encoding="UTF-8"?>
<cml xmlns="http://www.chemaxon.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.chemaxon.com/marvin/schema/mrvSchema_16_02_15.xsd" generator="PacDraw 1980">
<MDocument>
  <MChemicalStruct>
    <molecule molID="m1">
      <atomArray atomID="${atomIDs}" elementType="${elementTypes}"/>
      <bondArray>${bondArray}
      </bondArray>
    </molecule>
  </MChemicalStruct>
</MDocument>
</cml>`;

	return mol;
}
