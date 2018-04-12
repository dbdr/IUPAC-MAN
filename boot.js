// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const Boot = function () {};

Boot.prototype = {

	preload: function () {
		//game.load.script('splash');
		game.add.plugin(PhaserInput.Plugin);

		this.load.audio('boot_sound', 'assets/sounds/boot.ogg');
	},

	create: function() {

		this.boot_sound = game.add.audio('boot_sound');

		const style = {
			width: game.width,
			height: game.height * 0.8,
			font: '20px Arial',
			fill: '#FFF',
			cursorColor: '#FFF',
			borderColor: '#000',
			backgroundColor: '#000',
			blockInput: false,
		};

		this.dateInput = game.add.inputField(game.width * 0.5, game.height * 0.1, style);
		// https://github.com/orange-games/phaser-input/issues/36
		//titleInput.anchor.set(0.5);
		this.dateInput.x -= this.dateInput.width / 2;

		this.dateInput.setText("Current date is April 12, 1980\nEnter new date:\nCurrent time is 0:00:00.0\nEnter new time:");


		this.titleInput = game.add.inputField(game.width * 0.5, game.height * 0.55, style);
		// https://github.com/orange-games/phaser-input/issues/36
		//titleInput.anchor.set(0.5);
		this.titleInput.x -= this.titleInput.width / 2;

		this.titleInput.setText("CX-DOS 1.0\n(C) 1980 CHEMAXON KFT");

		this.promptInput = game.add.inputField(game.width * 0.5, game.height * 0.85, style);
		// https://github.com/orange-games/phaser-input/issues/36
		//promptInput.anchor.set(0.5);
		this.promptInput.x -= this.promptInput.width / 2;

		this.promptInput.setText("A:>");

		this.dateInput.visible = false;
		this.titleInput.visible = false;
		this.promptInput.visible = false;

		game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(() => {
			game.input.keyboard.reset();
			this.boot0();
		});
	},

	boot0: function() {
		this.boot_sound.play();
		game.time.events.add(Phaser.Timer.SECOND * 6, this.boot1, this);
	},
	
	boot1: function() {
		this.dateInput.visible = true;
		game.time.events.add(Phaser.Timer.SECOND * 4, this.boot2, this);
	},
	
	boot2: function() {
		this.titleInput.visible = true;
		game.time.events.add(Phaser.Timer.SECOND * 4, this.boot3, this);
	},
	
	boot3: function() {
		this.promptInput.visible = true;

		const enter = () => {
			skipLogin = true;
			game.state.start('Splash', true);
		};
		
		this.promptInput.startFocus();
		this.promptInput.focusOut.add(enter);
		game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(enter);
	},
	
	update: function () {

	},
	
};

game.state.add('Boot', Boot);
