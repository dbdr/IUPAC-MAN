// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const Boot = function () {};

Boot.prototype = {

	preload: function () {
		//game.load.script('splash');
		game.add.plugin(PhaserInput.Plugin);
	},

	create: function() {

		const nameInput = game.add.inputField(game.width * 0.5, game.height * 0.2, {
			width: game.width,
			height: game.height * 0.8,
			font: '30px Arial',
			fill: '#FFF',
			cursorColor: '#FFF',
			borderColor: '#000',
			backgroundColor: '#000',
			blockInput: false,
		});
		// https://github.com/orange-games/phaser-input/issues/36
		//nameInput.anchor.set(0.5);
		nameInput.x -= nameInput.width / 2;

		nameInput.setText("CX-DOS 1.0\n(C) 1980 CHEMAXON KFT");

		const promptInput = game.add.inputField(game.width * 0.5, game.height * 0.7, {
			width: game.width,
			height: game.height * 0.8,
			font: '30px Arial',
			fill: '#FFF',
			cursorColor: '#FFF',
			borderColor: '#000',
			backgroundColor: '#000',
			blockInput: false,
		});
		// https://github.com/orange-games/phaser-input/issues/36
		//nameInput.anchor.set(0.5);
		promptInput.x -= promptInput.width / 2;

		promptInput.setText("A:>");

		promptInput.startFocus();

		const enter = () => {
			game.state.start('Splash', true);
		};
		
		promptInput.focusOut.add(enter);
		game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(enter);

	},

	update: function () {

	},
	
};

game.state.add('Boot', Boot);
