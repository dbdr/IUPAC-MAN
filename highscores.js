// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

let highscores = window.localStorage.getItem('highscores');
if (highscores)
	highscores = JSON.parse(highscores);
else
	highscores = [];

console.log("Loaded highscores:", highscores);

function addScore(score) {
	if (! username)
		return;
	
	console.log("Score", username, teams, score);

	const highscore = highscores.find(h => h.name === username);
	if (highscore) {
		highscore.score = Math.max(score, highscore.score);
		highscore.teams = teams;
	}
	else
		highscores.push({name: username, teams: teams, score: score});

	highscores.sort((h1,h2) => h2.score - h1.score);
	console.log(highscores);
	window.localStorage.setItem('highscores', JSON.stringify(highscores));
}
	
const Highscores = function () {};

Highscores.prototype = {

	preload: function () {
	},

	create: function() {

		const headerY = 100;

		const rankX = game.width * 0.15;
		const scoreX = game.width * 0.3
		const nameX = game.width * 0.6;
		
		const rankText = game.add.text(rankX, headerY, "NO.", {fill : '#FFF'});
		const scoreText = game.add.text(scoreX, headerY, "SCORE", {fill : '#FFF'});
		const nameText = game.add.text(nameX, headerY, "NAME", {fill : '#FFF'});

		let rank = 0;
		let Y = headerY;
		highscores.forEach(h => {
			// Display the top 5 plus the last user
			if (rank++ > 5 && h.name !== username)
				return;
			Y += 30;
			const style = {fill: h.name === username ? '#F00' : '#FFF'};
			game.add.text(rankX, Y, rank, style);
			game.add.text(scoreX, Y, Math.round(h.score), style);
			game.add.text(nameX, Y, h.name, style);
		});

		const pressText = game.add.text(game.width / 2, game.height * 0.9, "Press ESC to continue", {fill : '#FFF'});
		pressText.anchor.setTo(0.5);
		
		game.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(() => {
			game.state.start('Splash', true);
		});

	},

	update: function () {

	},
	
};

game.state.add('Highscores', Highscores);
