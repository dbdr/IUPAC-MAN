let tasks;

fetch('levels.json')
	.then((res) => res.json())
	.then((json) => tasks = json);

function getNextTaskText() {
	console.log(tasks);
	return tasks.shift().description;
}
