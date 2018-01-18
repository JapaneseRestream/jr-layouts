const request = require('superagent');

const FETCH_SCHEDULE_INTERVAL = 60 * 1000;

module.exports = nodecg => {
	const scheduleRep = nodecg.Replicant('schedule');
	const horaroId = nodecg.bundleConfig.horaroId;

	if (horaroId) {
		fetchHoraroSchedule();
		setInterval(fetchHoraroSchedule, FETCH_SCHEDULE_INTERVAL);
	}

	function fetchHoraroSchedule() {
		const url = `https://horaro.org/-/api/v1/schedules/${horaroId}`;

		request.get(url).end((err, {body: {data}}) => {
			if (err) {
				nodecg.log.error('Couldn\'t update Horaro schedule.');
				return;
			}

			const getIndexByLabel = label => data.columns.indexOf(label);
			const indices = {
				game: getIndexByLabel('ゲーム'),
				category: getIndexByLabel('カテゴリー'),
				console: getIndexByLabel('機種'),
				runners: getIndexByLabel('走者'),
				length: getIndexByLabel('Length'),
				english: getIndexByLabel('Game')
			};

			scheduleRep.value = data.items.map((run, index) => {
				return {
					index,
					scheduled: run.scheduled_t * 1000,
					game: run.data[indices.game] || '',
					category: run.data[indices.category] || 'Any%',
					console: run.data[indices.console] || '',
					runners: (run.data[indices.runners] || '').replace(/\\_/gi, '_'),
					length: run.data[indices.length] || '',
					english: run.data[indices.english] || '',
					commentator: ''
				};
			});
		});
	}
};
