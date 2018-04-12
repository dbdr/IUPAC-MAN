// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

console.log("Loading Highscores");

let highscores = window.localStorage.getItem('highscores');
if (highscores)
	highscores = JSON.parse(highscores);
else
	highscores = [];

console.log("Loaded highscores:", highscores);

const globalHS = [
	/*
	  EUGM 2018
	{"name":"SOZ","teams":"CXN","score":13680.221722897084},{"name":"MCS","teams":"CXN","score":12642.875091231797},{"name":"DBR","teams":"CXN,FRANCE","score":11600.259426366949},{"name":"PRD","teams":"PRDEL","score":9967.539241716822},{"name":"ZT","teams":"CONS","score":8682.53649982948},{"name":"SXS","teams":"JC4E","score":3782.8352679186764},
	{"name":"LNC","teams":"CXN","score":13647.481022051796},{"name":"BK","teams":"MCULE","score":12467.54688637997},{"name":"ACL","teams":"FRANCE","score":11752.290474378873},{"name":"SOZ","teams":"CXN","score":11006.087866625405},{"name":"ASD","teams":"ASD","score":10288.746886379971},{"name":"ZT","teams":"C","score":8658.310762316518},{"name":"RK","teams":"AFO","score":7041.7152102257905},{"name":"PC","teams":"CXN","score":5178.610228485887},{"name":"DBR","teams":"CXN","score":1980.9812622556383},{"name":"AAA","teams":"C,F","score":1954.8465609082712},{"name":"VKM","teams":"I","score":1935.1889347143651},{"name":"ARU","teams":"PAT","score":1868.3033690388493},{"name":"NAT","teams":"SLV","score":1858.6316667474046},
	{"name":"RHO","teams":"ELSEVIER","score":9657.714679868533},{"name":"A","teams":"CREG","score":7833.009785988286},{"name":"PC","teams":"CXN","score":7353.588341067268},{"name":"FLC","teams":"NVLX","score":3461.3002233989405},{"name":"DBR","teams":"CXN","score":1984.3226097648096},{"name":"MIC","teams":"CHEMAXON","score":1894.0342429254692},
	{"name":"BOB","teams":"CXN","score":14706},
	{"name":"JEV","teams":"SWEDEN,SPRINTBIOSCIENCE","score":14043},
	*/
	// USUGM 2018
	{"name":"DBR","teams":"CXN,FR","score":14247.041818475493},{"name":"MCS","teams":"CXN,HU","score":14049.31514835557},{"name":"RK","teams":"GER","score":13995.130796561201},{"name":"AP","teams":"CXN,HU","score":12636.689503441781},{"name":"VA","teams":"HU","score":12593.294905097879},{"name":"IAN","teams":"IDBS","score":12198.954441037662},{"name":"T","teams":"CXN","score":9771.29748579934},{"name":"SCT","teams":"PFE","score":8932.814137504252},{"name":"DD","teams":"SCILLIGENCE","score":8505.229562384622},{"name":"NAT","teams":"IDBS,FR","score":4152.279561260049},
];

function addScore(score) {
	console.log("Score", score);

	if (! score.name)
		return;
	
	const highscore = highscores.find(h => h.name === score.name);
	if (highscore) {
		highscore.score = Math.max(score.score, highscore.score);
		highscore.teams = merge(highscore.teams, score.teams);
	}
	else
		highscores.push(score);

	highscores.sort((h1,h2) => h2.score - h1.score);
	const hsData = JSON.stringify(highscores);
	console.log(hsData);
	window.localStorage.setItem('highscores', hsData);
}

function merge(teams1, teams2) {
	let all = [];
	[teams1,teams2].forEach(teams => {
		if (teams)
			teams.split(",").forEach(team => {
				if (! all.find(t => t === team))
					all.push(team);
			});
	});
	return all.join(",");
}

globalHS.forEach(hs => addScore(hs));

function getRankedTeams() {
	let allTeams = [];
	highscores.forEach(h => {
		if (! h.teams)
			return;
		h.teams.split(",").forEach(t => {
			const team = allTeams.find(at => t === at.name);
			if (team) {
				team.scores.push(h.score);
				team.players++;
			}
			else
				allTeams.push({name: t, scores: [h.score, 0, 0], players: 1 });
		});
	});
	allTeams.forEach(team => {
		team.scores.sort((s1,s2) => s2 - s1);
		const top = team.scores.slice(0, 2);
		team.score = top.reduce((acc, s) => acc +s) / top.length;
	});
	allTeams.sort((t1,t2) => t2.score - t1.score);
	return allTeams;
}

const Highscores = function () {};

Highscores.prototype = {

	preload: function () {
		if (typeof Credits === "undefined")
			game.load.script('credits');
	},

	create: function() {

		const headerY = game.width * 0.1;

		const rankX = game.width * 0.0;
		const IscoreX = game.width * 0.1
		const InameX = game.width * 0.3;
		const TscoreX = game.width * 0.5;
		const TnameX = game.width * 0.7;
		
		const rankText = game.add.text(rankX, headerY, "NO.", {fill : '#FFF'});
		const IscoreText = game.add.text(IscoreX, headerY, "SCORE", {fill : '#FFF'});
		const InameText = game.add.text(InameX, headerY, "NAME", {fill : '#FFF'});
		const TscoreText = game.add.text(TscoreX, headerY, "SCORE", {fill : '#FFF'});
		const TnameText = game.add.text(TnameX, headerY, "TEAM", {fill : '#FFF'});

		let rank = 0;
		let Y = headerY;
		highscores.forEach(h => {
			// Display the top 5 plus the last user
			if (++rank > 8 && h.name !== username)
				return;
			Y += 30;
			const style = {fill: h.name === username ? '#F00' : '#FFF'};
			game.add.text(rankX, Y, rank, style);
			game.add.text(IscoreX, Y, Math.round(h.score), style);
			game.add.text(InameX, Y, h.name, style);
		});

		const rankedTeams = getRankedTeams();
		rank = 0;
		Y = headerY;
		rankedTeams.forEach(t => {
			// Display the top N plus the last user
			const ourTeam = teams.split(",").find(name => name === t.name);
			if (++rank > 8 && ! ourTeam)
				return;
			Y += 30;
			const style = {fill: ourTeam ? '#F00' : '#FFF'};
			game.add.text(TscoreX, Y, Math.round(t.score), style);
			game.add.text(TnameX, Y, t.name, style);
		});
		
		const pressText = game.add.text(game.width / 2, game.height * 0.9, "Press ESC to continue", {fill : '#FFF'});
		pressText.anchor.setTo(0.5);
		
		game.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(() => {
			const showCredits = true;
			if (showCredits)
				game.state.start('Credits', true);
			else
				game.state.start('Splash', true);
		});

	},

	update: function () {

	},
	
};

game.state.add('Highscores', Highscores);
