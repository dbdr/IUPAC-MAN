// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const Splash = function () {};

Splash.prototype = {

	loadScript: function (scriptName) {
		game.load.script(scriptName);
	},

	preload: function () {
		this.load.audio('opening_song', 'assets/sounds/opening_song.ogg');

		this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);

		this.load.image('cxn-logo', 'assets/cxn-logo-32.png');

		if (typeof pacman === 'undefined') {
			this.loadScript('pacman');
			this.loadScript('game');
		}
	},

	create: function() {
		this.cxnLogo = game.add.sprite(game.width - 10, game.height - 10, 'cxn-logo');
		this.cxnLogo.anchor.set(1, 1);
		this.cxnLogo.visible = false;

		this.copyrightText = game.add.text(game.width - 50, game.height - 10, "(c) 1980 ChemAxon Kft", {fontSize: 8, fill: '#FFF'});
		this.copyrightText.anchor.set(1, 0.6);
		this.copyrightText.visible = false;
		
		this.opening_song = game.add.audio('opening_song');

		createPacman(-20);

		// For intro
		game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(() => {
			game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
			this.introText = game.add.text(game.width / 2, game.height / 2, 'ChemAxon presents', {fontSize: 16, fill: '#FFF'});
			this.introText.anchor.set(0.5);
			setTimeout(() => {
				this.introText.setText('');
				setTimeout(() => {
					this.introText.setText('IUPAC-MAN');
					pacman.movesLeft = Math.round((game.width - pacman.x) / xFactor / 2);
					pacman.moveX = 1;
					pacman.moveY = 0;
					pacman.finalX = pacman.lx + pacman.movesLeft;
					pacman.finalY = pacman.y;
					this.opening_song.play();
				}, 1000);
			}, 3000);
		});
		/*
		this.status.setText('Ready!');
		this.addGameMusic();

		setTimeout(function () {
			//game.state.start("GameMenu");
		}, 5000);
		*/
	},

	update: function () {

		if (this.introText && (this.introText.x - pacman.x < 200 || pacman.movesLeft === 0)) {
			this.introText.x++;
			if (this.introText.x - this.introText.width / 2 > game.width) {
				this.introText.destroy();
				this.introText = null;
				// Only show after intro
				this.cxnLogo.visible = true;
				this.copyrightText.visible = true;
				game.state.start('Game', false);
			}
		}

	},
	
};
