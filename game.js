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
			game.load.script('highscores');
		}
		
		this.load.audio('die', 'assets/sounds/die.ogg');
		this.load.audio('eating', 'assets/sounds/eating.ogg');
		this.load.audio('eatpill', 'assets/sounds/eatpill.ogg');
		this.load.audio('intermission', 'assets/sounds/intermission.ogg');

	},

	create: function () {
		clearMolecule();
		
		// Position of pacman after he finishes moving
		this.finalX = pacman.lx;
		this.finalY = pacman.y;
		
		this.die = game.add.audio('die');
		this.eating = game.add.audio('eating');
		this.eatpill = game.add.audio('eatpill');
		this.intermission = game.add.audio('intermission');

		this.solubility = game.add.text(0, game.height - 200, "", {fontSize: 12, fill: '#FFF'});
		this.atomCount = game.add.text(0, game.height - 175, "", {fontSize: 12, fill: '#FFF'});
		this.logP = game.add.text(0, game.height - 150, "", {fontSize: 12, fill: '#FFF'});
		this.donorCount = game.add.text(0, game.height - 125, "", {fontSize: 12, fill: '#FFF'});
		this.acceptorCount = game.add.text(0, game.height - 105, "", {fontSize: 12, fill: '#FFF'});
		this.molecularMass = game.add.text(0, game.height - 75, "", {fontSize: 12, fill: '#FFF'});
		this.iupacName = game.add.text(0, game.height - 50, "", {fontSize: 12, fill: '#FFF'});
		this.molecularFormula = game.add.text(0, game.height - 25, "", {fontSize: 12, fill: '#FFF'});

		this.acceptorCount.visible = false;
		this.donorCount.visible = false;
		this.logP.visible = false;
		this.solubility.visible = false;
		this.atomCount.visible = false;
		
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
			this.die.onStop.add(() => game.state.start('Highscores', true));
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

		this.curScore = 0;
		this.curScoreText = game.add.text(game.width, 100, '0', {fontSize: 20, fill: '#FFF'});
		this.curScoreText.anchor.set(1, 0);
		this.curScoreText.visible = false;

		this.totalScore = 0;
		this.totalScoreText = game.add.text(game.width, 140, '0', {fontSize: 20, fill: '#FFF'});
		this.totalScoreText.anchor.set(1, 0);
		this.totalScoreText.visible = false;

		this.usernameText = game.add.text(game.width, 180, username, {fontSize: 20, fill: '#FFF'});
		this.usernameText.anchor.set(1, 0);

		this.challengeText = game.add.text(game.width, 20, '', {fontSize: 12, fill: '#FFF'});
		this.challengeText.anchor.set(1, 0);
		this.helpText = game.add.text(game.width, 40, 'Press ENTER to start game', {fontSize: 12, fill: '#FFF'});
		this.helpText.anchor.set(1, 0);
		this.hintText = game.add.text(game.width, 60, '', {fontSize: 12, fill: '#FFF'});
		this.hintText.anchor.set(1, 0);
		
		game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(() => {
			this.nextChallenge();
			this.curScoreText.visible = true;
			this.totalScoreText.visible = true;
		});

		game.input.keyboard.addKey(Phaser.Keyboard.H).onDown.add(() => {
			this.hintText.setText(getNextHint());
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
		this.molecularMass.setText('');
		this.donorCount.setText('');
		this.acceptorCount.setText('');
		this.logP.setText('');
		this.solubility.setText('');
		this.atomCount.setText('');
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

	},
	
	molChanged : function () {
		if (Object.keys(atoms).length === 0)
			return;
		
		getIUPACName().then((name) => {
			if (name.includes('errorCode')) {
				console.log(name);
				name = '';
			}
			this.iupacName.setText(name);

			if (currentChallenge && name === currentChallenge.name)
				this.challengeSolved();
		});
		getMolecularProperties().then((properties) => {
			console.log(properties);
			if (typeof properties === "string" && properties.includes('errorCode')) {
				console.log(properties);
				properties = { formula: '', mass: ''};
			}
			const formula = properties.elementalAnalysis.formula;
			const mass = properties.elementalAnalysis.mass;
			const aCount = properties.hbda.acceptorAtomCount;
			const dCount = properties.hbda.donorAtomCount;
			const logP = properties.logp;
			const solubility = properties.solubility.pHDependentSolubility.values.find(s => s.pH === 7.4).solubility;
			const atomCount = Object.keys(atoms).length;
			
			this.molecularFormula.setText(formula);
			this.molecularMass.setText("Mass: " + mass);
			this.acceptorCount.setText("Acceptor count: " + aCount);
			this.donorCount.setText("Donor count: " + dCount);
			this.logP.setText("logP: " + logP.toFixed(2));
	 		this.solubility.setText("logS: " + solubility.toFixed(2));
	 		this.atomCount.setText("Atom count " + atomCount);

			if (currentChallenge && formula === currentChallenge.formula)
				this.challengeSolved();
			
			if (this.designChallenge) {
				const green = '#0F0';
				const red = '#F00';
				this.molecularMass.fill = mass <= 500 ? green : red;
				this.donorCount.fill = dCount <= 5 ? green : red;
				this.acceptorCount.fill = aCount <= 10 ? green : red;
				this.logP.fill = logP <= 5 ? green : red;
				this.atomCount.fill = atomCount >= 10 ? green : red;

				if (mass <= 500 && dCount <= 5 && aCount <= 10 && logP <= 5 && atomCount >= 10) {
					this.curScore = Math.max(this.curScore, solubility * 1000);
					this.pointsWon = this.baseScore + this.curScore - this.totalScore;
				}
				else {
					this.curScore = 0;
				}
			}
		});
	},

	challengeSolved : function () {
		this.pointsWon = this.curScore;

		this.intermission.play();
	},

	nextChallenge : function () {
		if (this.designChallenge)
			return;
		
		const text = getNextChallengeText();
		this.challengeText.setText(text);
		this.helpText.setText('Press H for hints, ENTER to skip, ESC to quit');
		this.hintText.setText('');
		if (currentChallenge.calculation === "solubility") {
			this.curScore = 0;
			this.acceptorCount.visible = true;
			this.donorCount.visible = true;
			this.logP.visible = true;
			this.solubility.visible = true;
			this.atomCount.visible = true;
			this.designChallenge = true;
			this.baseScore = this.totalScore;
		}
		else {
			this.curScore = 2000;
			this.designChallenge = false;
		}
		this.molChanged();
	},
	
	updateScore : function () {
		if (this.pointsWon && this.pointsWon > 0) {
			const points = Math.min(10, this.pointsWon);
			this.pointsWon -= points;
			if (! this.designChallenge)
				this.curScore -= points;
			this.totalScore += points;
			
			if (this.pointsWon <= 0) {
				// Finished adding the points
				addScore(username, this.totalScore);
				if (! this.designChallenge)
					this.nextChallenge();
			}
		}
		else {
			if (! this.designChallenge)
				this.curScore = 1000 + 0.9998 * (this.curScore - 1000);
		}

		this.curScoreText.setText(Math.round(this.curScore / 10) * 10);
		this.totalScoreText.setText(Math.round(this.totalScore / 10) * 10);
	},
	
	update: function () {

		this.applyAtom();
		this.startMove();
		this.updateScore();

	}
};

game.state.add('Game', IUPACman);
