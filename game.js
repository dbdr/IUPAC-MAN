// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const game = new Phaser.Game(500, 500, Phaser.AUTO);

const bondLength = 32;
const doubleBondRatio = 14;

const IUPACman = function (game) {

	this.xFactor = Math.sqrt(3);
	
	this.movesLeft = 0;
	this.moveX = 0;
	this.moveY = 0;
	this.nextMoveX = 0;
	this.nextMoveY = 0;
	this.bondType = 1;
};

IUPACman.prototype = {

	init: function () {

		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;

		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

	},

	preload: function () {

		this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);

		this.load.audio('eating', 'assets/sounds/eating.ogg');
		this.load.audio('opening_song', 'assets/sounds/opening_song.ogg');

		//  Needless to say, graphics (C)opyright Namco

	},

	create: function () {

		this.pacman = this.add.sprite(game.width / 2, game.height / 2, 'pacman', 0);
		this.pacman.anchor.set(0.5);
		this.pacman.animations.add('munch', [0, 1, 2, 1], 20, true);

		this.pacman.play('munch');

		this.eating = game.add.audio('eating');
		this.opening_song = game.add.audio('opening_song');

		//  These take time to decode, so we can't play them instantly
		//  Using setDecodedCallback we can be notified when they're ALL ready for use.
		//  The audio files could decode in ANY order, we can never be sure which it'll be.
		this.sound.setDecodedCallback([ this.eating, this.opening_song ], this.start, this);

		this.molGraphics = game.add.graphics();
		this.molGraphics.lineStyle(3, 0xffffff, 1);

		// Pause
		this.game.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(() => {
			if (this.game.paused) {
				this.pauseText.destroy();
			}
			else {
				const style = {fill : '#FFF'};
				this.pauseText = this.game.add.text(this.game.width * 0.5, this.game.height * 0.5, "Paused", style);
				this.pauseText.anchor.set(0.5, 0.5);
			}
			this.game.paused = ! this.game.paused;
		});

		// Mute
		this.game.input.keyboard.addKey(Phaser.Keyboard.M).onDown.add(() => {
			this.game.sound.mute = ! this.game.sound.mute;
		});
		
		this.game.input.keyboard.addKey(Phaser.Keyboard.W).onDown.add(() => { this.keyMove( 0, -2, 270); });
		this.game.input.keyboard.addKey(Phaser.Keyboard.S).onDown.add(() => { this.keyMove( 0, +2,  90); });

		this.game.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(() => { this.keyMove(-1, -1, 210); });
		this.game.input.keyboard.addKey(Phaser.Keyboard.A).onDown.add(() => { this.keyMove(-1, +1, 120); });

		this.game.input.keyboard.addKey(Phaser.Keyboard.E).onDown.add(() => { this.keyMove(+1, -1, 300); });
		this.game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(() => { this.keyMove(+1, +1,  30); });

		this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(() =>   { this.bondType = 1; });
		this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(() =>   { this.bondType = 2; });
		this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(() => { this.bondType = 3; });
	},

	start: function () {
		console.log('ready');
		this.opening_song.play();
	},

	keyMove: function (dx, dy, angle) {
		this.nextMoveX = dx;
		this.nextMoveY = dy;
		this.nextAngle = angle;
	},

	startMove : function () {
		if (this.movesLeft > 0)
			return;

		if (this.nextMoveX === 0 && this.nextMoveY === 0)
			return;

		this.eating.play();
		
		this.moveX = this.nextMoveX;
		this.moveY = this.nextMoveY;
		this.pacman.angle = this.nextAngle;
		
		this.movesLeft = bondLength;
		this.nextMoveX = this.nextMoveY = 0;

		this.addBond();
	},

	addBond : function () {
		const line = new Phaser.Line(this.pacman.x, this.pacman.y, this.pacman.x + bondLength * this.moveX * this.xFactor, this.pacman.y + bondLength * this.moveY);

		if (this.bondType !== 1) {
			const dx = (line.end.x - line.start.x) / doubleBondRatio;
			const dy = (line.end.y - line.start.y) / doubleBondRatio;
			
			this.molGraphics.moveTo(line.start.x + dy, line.start.y - dx);
			this.molGraphics.lineTo(line.end.x   + dy, line.end.y   - dx);

			this.molGraphics.moveTo(line.start.x - dy, line.start.y + dx);
			this.molGraphics.lineTo(line.end.x   - dy, line.end.y   + dx);
		}

		if (this.bondType !== 2) {
			this.molGraphics.moveTo(line.start.x, line.start.y);
			this.molGraphics.lineTo(line.end.x, line.end.y);
		}
		
		addBond(this.moveX, this.moveY, this.bondType);
		this.bondType = 1;
	},
	
	continueMove : function () {
		if (this.movesLeft == 0)
			return;

		this.pacman.x += this.moveX * this.xFactor;
		this.pacman.y += this.moveY;
		this.movesLeft--;
	},

	update: function () {

		this.startMove();
		this.continueMove();

	}
};

game.state.add('Game', IUPACman, true);
