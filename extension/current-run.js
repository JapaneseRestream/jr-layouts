const clone = require('clone');

module.exports = nodecg => {
	const scheduleRep = nodecg.Replicant('schedule');
	const currentRunRep = nodecg.Replicant('currentRun');

	const setCurrentRunByIndex = index => {
		if (index >= 0 && index < scheduleRep.value.length) {
			currentRunRep.value = clone(scheduleRep.value[index]);
		}
	};

	scheduleRep.on('change', () => {
		if (!currentRunRep.value.index) {
			setCurrentRunByIndex(0);
		}
	});

	nodecg.listenFor('nextRun', () => {
		setCurrentRunByIndex(currentRunRep.value.index + 1);
	});
	nodecg.listenFor('previousRun', () => {
		setCurrentRunByIndex(currentRunRep.value.index - 1);
	});
	nodecg.listenFor('specificRun', index => {
		setCurrentRunByIndex(index);
	});
	nodecg.listenFor('editRun', (data, ack) => {
		// Intentionally mutates replicant object
		Object.assign(currentRunRep.value, data);
		ack();
	});
};
