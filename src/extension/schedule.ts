import _ from 'lodash';
import moment from 'moment';

import {Run} from '../nodecg/replicants';

import {NodeCG} from './nodecg';

export const setupSchedule = (nodecg: NodeCG) => {
	const spreadsheetRep = nodecg.Replicant('spreadsheet', {defaultValue: {}});
	const scheduleRep = nodecg.Replicant('schedule', {
		defaultValue: [],
	});
	const currentRunRep = nodecg.Replicant('currentRun', {
		defaultValue: null,
	});

	const setCurrentRun = (index: number) => {
		if (!scheduleRep.value) {
			return;
		}
		const newCurrentRun = scheduleRep.value[index];
		if (!newCurrentRun) {
			nodecg.log.error('Invalid index to apply to current run replicant');
			return;
		}
		currentRunRep.value = _.clone(newCurrentRun);
	};

	spreadsheetRep.on('change', ({eventInfo, gamesList}) => {
		if (!eventInfo || !gamesList) {
			return;
		}
		const startTime = moment(eventInfo.startTime);
		const newScheduleValue = gamesList.map((game, index) => {
			const run: Run = {
				category: game.category || game.originalCategory,
				commentator: game.commentators,
				console: game.platform,
				english: game.originalTitle,
				game: game.title,
				index,
				runTime: game.runDuration,
				runners: '',
				scheduled: startTime.toISOString(),
				setupTime: game.setupDuration,
			};
			startTime
				.add(moment.duration(game.runDuration))
				.add(moment.duration(game.setupDuration));
			return run;
		});
		if (!_.isEqual(scheduleRep.value, newScheduleValue)) {
			scheduleRep.value = _.clone(newScheduleValue);
		}
		if (!currentRunRep.value) {
			setCurrentRun(0);
		}
	});

	nodecg.listenFor('previousRun', () => {
		if (currentRunRep.value) {
			setCurrentRun(currentRunRep.value.index - 1);
		} else {
			setCurrentRun(0);
		}
	});

	nodecg.listenFor('nextRun', () => {
		if (currentRunRep.value) {
			setCurrentRun(currentRunRep.value.index + 1);
		} else {
			setCurrentRun(0);
		}
	});
};
