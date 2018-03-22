// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

console.log("Loading Main");

const game = new Phaser.Game(600, 400),
	  Main = function () {};

Main.prototype = {

	init: function () {

		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;

		Phaser.Canvas.setImageRenderingCrisp(game.canvas);

	},

	preload: function () {
		game.load.script('splash',  'splash.js');
	},

	create: function () {
		game.state.start('Splash');
	}

};

game.state.add('Main', Main);
game.state.start('Main');
