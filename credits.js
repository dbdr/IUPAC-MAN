// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const Credits = function () {};

Credits.prototype = {

	preload: function () {
		this.load.image('iupac-man-title', 'assets/iupac-man-title.png');
	},

	create: function() {
		this.iupacManTitle = game.add.sprite(game.width / 2, game.height, 'iupac-man-title');
		this.iupacManTitle.anchor.set(0.5, 0);

		this.creditsText = game.add.text
			(game.width / 2, game.height + 100,
			 "Lead programming\n" +
			 "Daniel Bonniot\n" +
			 "\n" +
			 "Scientific advising\n" +
			 "Anna Tomin\n" +
			 "Dora Barna\n" +
			 "\n" +
			 "Art design\n" +
			 "Balázs Hafra\n" +
			 "Namco (c) 1980\n",
			 {align: 'center', fontSize: 16, fill: '#FFF'});
		this.creditsText.anchor.set(0.5, 0);
		
		game.input.keyboard.onPressCallback = e => {
			game.input.keyboard.onPressCallback = null;
			game.state.start('Splash', true);
		};
	},

	update: function () {

		if (this.iupacManTitle.y > game.height * 0.08) {
			this.iupacManTitle.y--;
			this.creditsText.y--;
		}

	},
	
};

game.state.add('Credits', Credits);
