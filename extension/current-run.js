const clone = require('clone');

module.exports = nodecg => {
	const scheduleRep = nodecg.Replicant('schedule');
	const currentRunRep = nodecg.Replicant('currentRun');

	scheduleRep.on('change', () => {
		if (!currentRunRep.value.index) {
			setCurrentRunByIndex(0);
		} else {
			setCurrentRunByIndex(currentRunRep.value.index);
		}
	});

	nodecg.listenFor('nextRun', (_, cb) => {
		setCurrentRunByIndex(currentRunRep.value.index + 1);
		if (typeof cb === 'function') {
			cb();
		}
	});
	nodecg.listenFor('previousRun', (_, cb) => {
		setCurrentRunByIndex(currentRunRep.value.index - 1);
		if (typeof cb === 'function') {
			cb();
		}
	});
	nodecg.listenFor('specificRun', (index, cb) => {
		setCurrentRunByIndex(index);
		if (typeof cb === 'function') {
			cb();
		}
	});
	nodecg.listenFor('editRun', (data, cb) => {
		Object.assign(currentRunRep.value, data);
		if (typeof cb === 'function') {
			cb();
		}
	});

	function setCurrentRunByIndex(index) {
		if (index >= 0 && index < scheduleRep.value.length) {
			currentRunRep.value = clone(scheduleRep.value[index]);
		}
	}
};
