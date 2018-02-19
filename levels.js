let tasks;

fetch('levels.json')
	.then((res) => res.json())
	.then((json) => tasks = json);

function getNextTaskText() {
	const next = tasks.shift();
	if (! next)
		return '';
	if (next.description)
		return next.description;
	else if (next.name)
		return 'Draw "' + next.name + '"';
	else if (next.formula)
		return 'Draw ' + next.formula;
	else
		return '';
}
