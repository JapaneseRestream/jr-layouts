const request = require('superagent');

const FETCH_SCHEDULE_INTERVAL = 60 * 1000;

module.exports = nodecg => {
	const scheduleRep = nodecg.Replicant('schedule');
	const { trackerUrl } = nodecg.bundleConfig;

	if (!trackerUrl) {
		nodecg.log.info("Tracker URL is not provided. Schedule won't be fetched");
		return;
	}

	fetchHoraroSchedule();
	setInterval(fetchHoraroSchedule, FETCH_SCHEDULE_INTERVAL);

	function fetchHoraroSchedule() {
		const url = trackerUrl;

		request.get(url).end((err, { body }) => {
			if (err) {
				nodecg.log.error("Couldn't update Horaro schedule.");
				return;
			}

			scheduleRep.value = body.map(run => {
				const { fields, pk } = run;
				return {
					index: fields.order,
					pk,
					scheduled: fields.starttime,
					game: fields.name || '',
					category: fields.category || 'Any%',
					console: fields.console || '',
					runners: fields.deprecated_runners || '',
					english: fields.name || '',
					commentator: ''
				};
			});
		});
	}
};
