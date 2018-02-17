// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const game = new Phaser.Game(480, 300);

const bondLength = 20;
const doubleBondRatio = 14;
const xFactor = Math.sqrt(3);

const IUPACman = function (game) {
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

		Phaser.Canvas.setImageRenderingCrisp(game.canvas);

	},

	preload: function () {

		this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
		this.load.image('cxn-logo', 'assets/cxn-logo-32.png');

		this.load.audio('eating', 'assets/sounds/eating.ogg');
		this.load.audio('eatpill', 'assets/sounds/eatpill.ogg');
		this.load.audio('opening_song', 'assets/sounds/opening_song.ogg');

		//  Needless to say, graphics (C)opyright Namco
	},

	create: function () {
		game.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		
		this.cxnLogo = game.add.sprite(game.width - 10, game.height - 10, 'cxn-logo');
		this.cxnLogo.anchor.set(1, 1);

		this.copyrightText = game.add.text(game.width - 50, game.height - 10, "(c) 1980 ChemAxon Kft", {fontSize: 8, fill: '#FFF'});
		this.copyrightText.anchor.set(1, 0.6);
		this.copyrightText.scale.set(2);
		
		const lx = Math.round(game.width / 2 / xFactor); // logical x, not scaled
		this.pacman = this.add.sprite(lx * xFactor, game.height / 2, 'pacman', 0);
		this.pacman.lx = lx;
		this.pacman.anchor.set(0.5);
		this.pacman.animations.add('munch', [0, 1, 2, 1], 20, true);
		this.pacman.lx = this.pacman.x / xFactor; // logical x, not scaled

		this.pacman.play('munch');

		this.eating = game.add.audio('eating');
		this.eatpill = game.add.audio('eatpill');
		this.opening_song = game.add.audio('opening_song');

		//  These take time to decode, so we can't play them instantly
		//  Using setDecodedCallback we can be notified when they're ALL ready for use.
		//  The audio files could decode in ANY order, we can never be sure which it'll be.
		this.sound.setDecodedCallback([ this.eating, this.opening_song ], this.start, this);

		this.iupacName = game.add.text(0, game.height - 50, "", {fontSize: 12, fill: '#FFF'});
		
		// Pause
		game.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(() => {
			if (game.paused) {
				this.pauseText.destroy();
			}
			else {
				this.pauseText = game.add.text(game.width * 0.5, game.height * 0.5, "Paused", {fill : '#FFF'});
				this.pauseText.anchor.set(0.5, 0.5);
			}
			game.paused = ! game.paused;
		});

		// Mute
		game.input.keyboard.addKey(Phaser.Keyboard.M).onDown.add(() => {
			game.sound.mute = ! game.sound.mute;
		});

		const shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
		
		game.input.keyboard.addKey(Phaser.Keyboard.W).onDown.add(() => { this.keyMove( 0, -2, 270); });
		game.input.keyboard.addKey(Phaser.Keyboard.S).onDown.add(() => { this.keyMove( 0, +2,  90); });

		game.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(() => { this.keyMove(-1, -1, 210); });
		game.input.keyboard.addKey(Phaser.Keyboard.A).onDown.add(() => {
			if (! shiftKey.isDown)
				this.keyMove(-1, +1, 120);
			else
				this.keyMove(-2, 0,  180);
		});

		game.input.keyboard.addKey(Phaser.Keyboard.E).onDown.add(() => { this.keyMove(+1, -1, 300); });
		game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(() => {
			if (! shiftKey.isDown)
				this.keyMove(+1, +1,  30);
			else
				this.keyMove(+2, 0,    0);
		});

		game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(() =>   { this.bondType = 1; });
		game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(() =>   { this.bondType = 2; });
		game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(() => { this.bondType = 3; });

		game.input.keyboard.addKey(Phaser.Keyboard.C).onDown.add(() => { this.keyAtom('C', 6); });
		game.input.keyboard.addKey(Phaser.Keyboard.O).onDown.add(() => { this.keyAtom('O', 8, '#F00'); });
		game.input.keyboard.addKey(Phaser.Keyboard.N).onDown.add(() => { this.keyAtom('N', 7, '#00F'); });
	},

	start: function () {
		console.log('Sounds loaded');
		this.opening_song.play();
	},

	outside: function (x, y) {
		return x < 0 || y < 0 || x > game.width || y > game.height;
	},
	
	keyMove: function (dx, dy, angle) {
		if (this.outside(this.pacman.x + dx * bondLength * xFactor, this.pacman.y + dy * bondLength)) {
			this.eatpill.play();
			return;
		}
		
		this.nextMoveX = dx;
		this.nextMoveY = dy;
		this.nextAngle = angle;
	},

	keyAtom: function(symbol, atno, color) {
		this.nextSymbol = symbol;
		this.nextAtno = atno;
		this.nextColor = color;
	},

	applyAtom : function() {
		if (this.movesLeft > 0)
			return;

		if (! this.nextSymbol)
			return;

		const atom = getAtom(this.pacman.lx, this.pacman.y);
		atom.atno = this.nextAtno;
		atom.symbol = this.nextSymbol;
		this.molChanged();
		
		if (atom.symbolText)
			atom.symbolText.destroy();

		if (atom.symbol !== 'C') {
			const style = {fill : this.nextColor};
			atom.symbolText = game.add.text(atom.x * xFactor, atom.y, atom.symbol, style);
			atom.symbolText.anchor.set(0.5, 0.5);
		}
		
		this.nextSymbol = this.nextAtno = null;
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
		const bond = getBond(this.pacman.lx, this.pacman.y, this.moveX * bondLength, this.moveY * bondLength, this.bondType);
		this.molChanged();

		if (bond.sprite)
			bond.sprite.destroy();
		
		const bondGraphics = game.add.graphics();
		bondGraphics.lineStyle(3, 0xffffff, 1);

		const line = new Phaser.Line(this.pacman.x, this.pacman.y, this.pacman.x + bondLength * this.moveX * xFactor, this.pacman.y + bondLength * this.moveY);

		if (this.bondType !== 1) {
			// ratio of bond length to double/triple bond distance
			let ratio = doubleBondRatio;
			if (this.bondType === 3)
				ratio /= 2;
			
			const dx = (line.end.x - line.start.x) / ratio;
			const dy = (line.end.y - line.start.y) / ratio;
			
			bondGraphics.moveTo(line.start.x + dy, line.start.y - dx);
			bondGraphics.lineTo(line.end.x   + dy, line.end.y   - dx);

			bondGraphics.moveTo(line.start.x - dy, line.start.y + dx);
			bondGraphics.lineTo(line.end.x   - dy, line.end.y   + dx);
		}

		if (this.bondType !== 2) {
			bondGraphics.moveTo(line.start.x, line.start.y);
			bondGraphics.lineTo(line.end.x, line.end.y);
		}

		bond.sprite = bondGraphics;
		
		this.bondType = 1;
	},
	
	continueMove : function () {
		if (this.movesLeft == 0)
			return;

		this.pacman.lx += this.moveX;
		this.pacman.x += this.moveX * xFactor;
		this.pacman.y += this.moveY;
		this.movesLeft--;
	},

	molChanged : function () {
		getIUPACName().then((name) => {
			if (name.includes('errorCode')) {
				console.log(name);
				name = '';
			}
			this.iupacName.setText(name);
		});
	},
	
	update: function () {

		this.applyAtom();
		this.startMove();
		this.continueMove();

	}
};

game.state.add('Game', IUPACman, true);
