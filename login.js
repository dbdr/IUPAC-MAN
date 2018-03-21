// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const Login = function () {};

let username;
let teams;

Login.prototype = {

	preload: function () {
		game.add.plugin(PhaserInput.Plugin);
		game.load.script('highscores');
	},

	create: function() {

		const nameText = game.add.text(game.width * 0.5, game.height * 0.6, "ENTER YOUR NAME", {fill : '#FFF'});
		nameText.anchor.set(0.5);

		const nameInput = game.add.inputField(game.width * 0.5, game.height * 0.7, {
			max: 3,
			width: game.width,
			textAlign : 'center',
			font: '30px Arial',
			fill: '#FFF',
			cursorColor: '#FFF',
			borderColor: '#000',
			backgroundColor: '#000',
			forceCase: PhaserInput.ForceCase.upper,
			blockInput: false,
		});
		this.nameInput = nameInput;
		// https://github.com/orange-games/phaser-input/issues/36
		//nameInput.anchor.set(0.5);
		nameInput.x -= nameInput.width / 2;
		nameInput.startFocus();

		username = null;
		
		const enter = () => {
			console.log('enter', game.isRunning);
			if (! username) {
				username = nameInput.text.text;
				nameInput.setText('');
				nameText.setText('ENTER YOUR TEAM(S)');
				nameInput.domElement.setMax(25);
				nameInput.startFocus();
			}
			else {
				teams = nameInput.text.text;
				nameText.visible = false;
				nameInput.visible = false;
				this.foundUser.visible = false;
				game.state.start('Game', false);
			}
		};
		
		nameInput.focusOut.add(enter);
		game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(enter);

		this.foundUser = game.add.text(game.width * 0.5, game.height * 0.9, "", {fill : '#FFF'});
		this.foundUser.anchor.set(0.5);

	},

	update: function () {
		const cur = this.nameInput.text.text;
		const highscore = highscores.find(h => h.name === cur);
		let text;
		if (highscore)
			text = highscore.name + ": " + Math.round(highscore.score) + " points";
		else if (cur)
			text = "Welcome " + cur;
		else
			text = "";
		this.foundUser.setText(text);
	},
	
};

game.state.add('Login', Login);
