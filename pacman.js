// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

let pacman;

const xFactor = Math.sqrt(3);

function createPacman(lx) {
	// lx is logical x, not scaled
	pacman = game.add.sprite(lx * xFactor, game.height / 2, 'pacman', 0);
	pacman.lx = lx;
	pacman.anchor.set(0.5);
	pacman.animations.add('munch', [0, 1, 2, 1], 20, true);
	pacman.play('munch');

	pacman.update = function () {
		if (! pacman.movesLeft || pacman.movesLeft <= 0)
			return;
		
		pacman.lx += pacman.moveX;
		pacman.x += pacman.moveX * xFactor;
		pacman.y += pacman.moveY;
		pacman.movesLeft--;
	}
}
