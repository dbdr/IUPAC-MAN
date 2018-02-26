let challenges;

fetch('levels.json')
	.then((res) => res.json())
	.then((json) => challenges = json);

let currentChallenge;

function getNextChallengeText() {
	currentChallenge = challenges.shift();
	if (! currentChallenge)
		return '';
	if (currentChallenge.description)
		return currentChallenge.description;
	else if (currentChallenge.name)
		return 'Draw "' + currentChallenge.name + '"';
	else if (currentChallenge.formula)
		return 'Draw ' + currentChallenge.formula;
	else
		return '';
}
