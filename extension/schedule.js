const moment = require('moment');
const jrAxios = require('./lib/jr-axios');

const FETCH_SCHEDULE_INTERVAL = 10 * 1000;

module.exports = async nodecg => {
	const {eventName} = nodecg.bundleConfig;
	if (!eventName) {
		nodecg.log.error('Event name is not specified');
		return;
	}

	const eventUuidRep = nodecg.Replicant('eventUuid');

	if (!eventUuidRep.value) {
		const {data: events} = await jrAxios.get('/events');
		const targetEvent = events.find(e => e.shortName === eventName);
		if (!targetEvent) {
			nodecg.log.error('Could not find event');
			return;
		}
		eventUuidRep.value = targetEvent.uuid;
	}

	const scheduleRep = nodecg.Replicant('schedule');
	const fetchSchedule = async () => {
		try {
			const {data: schedule} = await jrAxios.get(
				`/events/${eventUuidRep.value}`
			);

			const gameStartsAt = moment(schedule.startsAt);
			scheduleRep.value = schedule.runs.map((run, index) => {
				const runTime = moment.duration(run.runTime);
				const setupTime = moment.duration(run.setupTime);
				gameStartsAt.add(setupTime);
				const formatted = {
					index,
					pk: run.uuid,
					scheduled: gameStartsAt.format(),
					game: run.game.displayName || run.game.originalName,
					category: run.category.displayName || run.category.originalName,
					console:
						run.game.hardware.displayName || run.game.hardware.originalName,
					runners: run.runners.map(r => r.name).join(', '),
					english: run.game.originalName,
					commentator: '',
				};
				gameStartsAt.add(runTime);
				return formatted;
			});
		} catch (err) {
			nodecg.log.error('Failed to fetch schedule');
			nodecg.log.error(err);
		}
	};

	fetchSchedule();
	setInterval(() => {
		fetchSchedule();
	}, FETCH_SCHEDULE_INTERVAL);
};
