// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const game = new Phaser.Game(500, 500, Phaser.AUTO);

const IUPACman = function (game) {

	this.bondLength = 32;
	this.xFactor = Math.sqrt(3);
	
	this.movesLeft = 0;
	this.moveX = 0;
	this.moveY = 0;
	this.nextMoveX = 0;
	this.nextMoveY = 0;
};

IUPACman.prototype = {

    init: function () {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    },

    preload: function () {

        //  We need this because the assets are on Amazon S3
        //  Remove the next 2 lines if running locally
        this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue005/';
        this.load.crossOrigin = 'anonymous';

        this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);

        //  Needless to say, graphics (C)opyright Namco

    },

    create: function () {

        this.pacman = this.add.sprite(game.width / 2, game.height / 2, 'pacman', 0);
        this.pacman.anchor.set(0.5);
        this.pacman.animations.add('munch', [0, 1, 2, 1], 20, true);

        this.pacman.play('munch');

		this.molGraphics = game.add.graphics();
		this.molGraphics.lineStyle(3, 0xffffff, 1);

		const me = this;

		this.game.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(function() {
			if (me.game.paused) {
				me.pauseText.destroy();
			}
			else {
				const style = {fill : '#FFF'};
				me.pauseText = me.game.add.text(me.game.width * 0.5, me.game.height * 0.5, "Paused", style);
				me.pauseText.anchor.set(0.5, 0.5);
			}
			me.game.paused = ! me.game.paused;
		});

		this.game.input.keyboard.addKey(Phaser.Keyboard.W).onDown.add(function() { me.keyMove( 0, -2, 270); });
		this.game.input.keyboard.addKey(Phaser.Keyboard.S).onDown.add(function() { me.keyMove( 0, +2,  90); });

		this.game.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(function() { me.keyMove(-1, -1, 210); });
		this.game.input.keyboard.addKey(Phaser.Keyboard.A).onDown.add(function() { me.keyMove(-1, +1, 120); });

		this.game.input.keyboard.addKey(Phaser.Keyboard.E).onDown.add(function() { me.keyMove(+1, -1, 300); });
		this.game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(function() { me.keyMove(+1, +1,  30); });
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

		this.moveX = this.nextMoveX;
		this.moveY = this.nextMoveY;
		this.pacman.angle = this.nextAngle;
		
		this.movesLeft = this.bondLength;
		this.nextMoveX = this.nextMoveY = 0;

		this.addBond();
	},

	addBond : function () {
		const line = new Phaser.Line(this.pacman.x, this.pacman.y, this.pacman.x + this.bondLength * this.moveX * this.xFactor, this.pacman.y + this.bondLength * this.moveY);

		this.molGraphics.moveTo(line.start.x, line.start.y);
		this.molGraphics.lineTo(line.end.x, line.end.y);
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
