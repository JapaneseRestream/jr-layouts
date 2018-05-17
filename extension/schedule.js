const request = require('superagent');

const FETCH_SCHEDULE_INTERVAL = 60 * 1000;

module.exports = nodecg => {
	const scheduleRep = nodecg.Replicant('schedule');
	const {trackerUrl, translationUrl} = nodecg.bundleConfig;

	if (!trackerUrl) {
		nodecg.log.info('Tracker URL is not provided. Schedule won\'t be fetched');
		return;
	}

	fetchHoraroSchedule();
	setInterval(fetchHoraroSchedule, FETCH_SCHEDULE_INTERVAL);

	function fetchHoraroSchedule() {
		request.get(translationUrl).end((err, {text}) => {
			if (err) {
				nodecg.log.error('Couldn\'t fetch translation info.');
			}

			let translation;
			try {
				translation = JSON.parse(text);
			} catch (err) {
				translation = [];
			}

			request.get(trackerUrl).end((err, {body}) => {
				if (err) {
					nodecg.log.error('Couldn\'t update Horaro schedule.');
					return;
				}

				scheduleRep.value = body.map((run, index) => {
					const {fields, pk} = run;
					const gameTranslation = translation.find(
						item => item.en.toLowerCase() === fields.name.toLowerCase()
					);
					return {
						index,
						pk,
						scheduled: fields.starttime,
						game: gameTranslation ? gameTranslation.jp || '' : '',
						category: fields.category || 'Any%',
						console: fields.console || '',
						runners: fields.deprecated_runners || '',
						english: fields.name || '',
						commentator: ''
					};
				});
			});
		});
	}
};
