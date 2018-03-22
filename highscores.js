// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

let highscores = window.localStorage.getItem('highscores');
if (highscores)
	highscores = JSON.parse(highscores);
else
	highscores = [];

console.log("Loaded highscores:", highscores);

const globalHS = [
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
	console.log(highscores);
	window.localStorage.setItem('highscores', JSON.stringify(highscores));
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
			if (rank++ > 5 && h.name !== username)
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
			if (rank++ > 8 && ! ourTeam)
				return;
			Y += 30;
			const style = {fill: ourTeam ? '#F00' : '#FFF'};
			game.add.text(TscoreX, Y, Math.round(t.score), style);
			game.add.text(TnameX, Y, t.name, style);
		});
		
		const pressText = game.add.text(game.width / 2, game.height * 0.9, "Press ESC to continue", {fill : '#FFF'});
		pressText.anchor.setTo(0.5);
		
		game.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(() => {
			const showCredits = false;
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
