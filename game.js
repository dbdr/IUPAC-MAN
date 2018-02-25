// -*- tab-width:4; c-basic-offset:4; -*-

'use strict';

const bondLength = 20;
const doubleBondRatio = 14;

const IUPACman = function (game) {
	this.nextMoveX = 0;
	this.nextMoveY = 0;
	this.bondType = 1;
};

IUPACman.prototype = {

	preload: function () {
		if (typeof atoms === 'undefined') {
			game.load.script('chem', 'chem.js');
			game.load.script('levels', 'levels.js');
			game.load.script('webservice', 'webservice.js');
		}
		
		this.load.audio('die', 'assets/sounds/die.ogg');
		this.load.audio('eating', 'assets/sounds/eating.ogg');
		this.load.audio('eatpill', 'assets/sounds/eatpill.ogg');

	},

	create: function () {
		clearMolecule();
		
		// Position of pacman after he finishes moving
		this.finalX = pacman.lx;
		this.finalY = pacman.y;
		
		this.die = game.add.audio('die');
		this.eating = game.add.audio('eating');
		this.eatpill = game.add.audio('eatpill');

		this.iupacName = game.add.text(0, game.height - 50, "", {fontSize: 12, fill: '#FFF'});
		this.molecularFormula = game.add.text(0, game.height - 25, "", {fontSize: 12, fill: '#FFF'});
		
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

		game.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(() => {
			this.die.play();
			this.die.onStop.add(() => game.state.start('Splash', true));
		});
		
		// Fullscreen
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.input.keyboard.addKey(Phaser.Keyboard.F).onDown.add(() => {
			if (game.scale.isFullScreen)
				game.scale.stopFullScreen();
			else
				game.scale.startFullScreen(false);
		});
	
		const controlKey = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
		const shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);

		game.input.keyboard.addKey(Phaser.Keyboard.X).onDown.add(() => {
			if (controlKey.isDown)
				this.clearCanvas();
		});

		this.score = 0;
		this.scoreText = game.add.text(game.width, 100, '0', {fontSize: 20, fill: '#FFF'});
		this.scoreText.anchor.set(1, 0);
		this.scoreText.visible = false;

		this.taskText = game.add.text(game.width, 20, '', {fontSize: 12, fill: '#FFF'});
		this.taskText.anchor.set(1, 0);
		this.hintText = game.add.text(game.width, 40, '', {fontSize: 12, fill: '#FFF'});
		this.hintText.anchor.set(1, 0);
		
		game.input.keyboard.addKey(Phaser.Keyboard.T).onDown.add(() => {
			this.taskText.setText(getNextTaskText());
			this.hintText.setText('Press H for hint');
			this.scoreText.visible = true;
		});
		
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

	teleportPacman : function(x, y) {
		pacman.lx = Math.round(x / xFactor);
		pacman.x = x;
		pacman.y = y;
		this.finalX = pacman.lx;
		this.finalY = y;
		pacman.angle = 0;
	},
	
	clearCanvas : function() {
		this.teleportPacman(game.width / 2, game.height / 2);
		for (let a in atoms)
			if (atoms[a].symbolText)
				atoms[a].symbolText.destroy();
		for (let b in bonds)
			if (bonds[b].sprite)
				bonds[b].sprite.destroy();
		clearMolecule();
		console.log('Molecule cleared');
		this.iupacName.setText('');
		this.molecularFormula.setText('');
		this.molChanged();
	},
	
	invalidMove: function (dx, dy) {
		const destLX = this.finalX + dx * bondLength;
		const destX = destLX * xFactor;
		const destY = this.finalY + dy * bondLength;
		
		if (this.outside(destX, destY))
			return true;

		const currentBond = getExistingBond(this.finalX, this.finalY, dx * bondLength, dy * bondLength);
		let valenceChange = this.bondType;
		if (currentBond)
			valenceChange -= currentBond.type;
		
		const source = getAtom(this.finalX, this.finalY);

		if (getHydrogenCount(source) < valenceChange)
			return true;

		const dest = getAtom(destLX, destY);
		
		if (getHydrogenCount(dest) < valenceChange)
			return true;

		return false;
	},
	
	outside: function (x, y) {
		return x < 0 || y < 0 || x > game.width || y > game.height;
	},
	
	keyMove: function (dx, dy, angle) {
		if (this.invalidMove(dx, dy)) {
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
		if (pacman.movesLeft > 0)
			return;

		if (! this.nextSymbol)
			return;

		const atom = getAtom(pacman.lx, pacman.y);

		if (getHydrogenCount(atom) - defaultValence(atom.atno) + defaultValence(this.nextAtno) < 0) {
			this.eatpill.play();
			this.nextSymbol = null;
			return;
		}

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
		if (pacman.movesLeft > 0)
			return;

		if (! (this.nextMoveX || this.nextMoveY))
			return;

		this.eating.play();
		
		pacman.moveX = this.nextMoveX;
		pacman.moveY = this.nextMoveY;
		pacman.angle = this.nextAngle;
		this.finalX = pacman.lx + pacman.moveX * bondLength;
		this.finalY = pacman.y + pacman.moveY * bondLength;
		
		pacman.movesLeft = bondLength;
		this.nextMoveX = this.nextMoveY = null;

		this.addBond();
	},

	addBond : function () {
		const bond = getBond(pacman.lx, pacman.y, pacman.moveX * bondLength, pacman.moveY * bondLength, this.bondType);
		this.molChanged();

		if (bond.sprite)
			bond.sprite.destroy();
		
		const bondGraphics = game.add.graphics();
		bondGraphics.lineStyle(3, 0xffffff, 1);

		const line = new Phaser.Line(pacman.x, pacman.y, pacman.x + bondLength * pacman.moveX * xFactor, pacman.y + bondLength * pacman.moveY);

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

		this.score += Math.round(Math.random() * 100) * 100;
		this.scoreText.setText(this.score);
	},
	
	molChanged : function () {
		getIUPACName().then((name) => {
			if (name.includes('errorCode')) {
				console.log(name);
				name = '';
			}
			this.iupacName.setText(name);
		});
		getMolecularFormula().then((formula) => {
			if (formula.includes('errorCode')) {
				console.log(formula);
				formula = '';
			}
			this.molecularFormula.setText(formula);
		});
	},
	
	update: function () {

		this.applyAtom();
		this.startMove();

	}
};

game.state.add('Game', IUPACman);
