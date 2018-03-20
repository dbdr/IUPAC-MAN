// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const Login = function () {};

let username = '???';

Login.prototype = {

	loadScript: function (scriptName) {
		game.load.script(scriptName);
	},

	preload: function () {
		game.add.plugin(PhaserInput.Plugin);
	},

	create: function() {

		const nameText = game.add.text(game.width * 0.5, game.height * 0.6, "ENTER YOUR NAME", {fill : '#FFF'});
		nameText.anchor.set(0.5);

		const nameInput = game.add.inputField(game.width * 0.5, game.height * 0.7, {
			max: 3,
			textAlign : 'center',
			font: '30px Arial',
			fill: '#FFF',
			cursorColor: '#FFF',
			borderColor: '#000',
			backgroundColor: '#000',
			forceCase: PhaserInput.ForceCase.upper,
			blockInput: false,
		});
		// https://github.com/orange-games/phaser-input/issues/36
		//nameInput.anchor.set(0.5);
		nameInput.x -= nameInput.width / 2;
		nameInput.startFocus();

		game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(() => {
			username = nameInput.text.text;
			nameText.visible = false;
			nameInput.visible = false;
			game.state.start('Game', false);
		});

	},

	update: function () {

	},
	
};

game.state.add('Login', Login);
