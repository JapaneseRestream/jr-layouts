import _ from 'lodash';
import moment from 'moment';
import {NodeCG} from 'nodecg/types/server';
import {Message, Replicant} from '../constants';
import {CurrentRun} from '../replicants/current-run';
import {Schedule} from '../replicants/schedule';
import {Run} from '../replicants/lib';
import {Spreadsheet} from '../replicants/spreadsheet';

export const setupSchedule = (nodecg: NodeCG) => {
	const spreadsheetRep = nodecg.Replicant<Spreadsheet>(Replicant.Spreadsheet);
	const scheduleRep = nodecg.Replicant<Schedule>(Replicant.Schedule);
	const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);

	const setCurrentRun = (index: number) => {
		const newCurrentRun = scheduleRep.value[index];
		if (!newCurrentRun) {
			nodecg.log.error('Invalid index to apply to current run replicant');
			return;
		}
		currentRunRep.value = scheduleRep.value[index];
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
			scheduleRep.value = newScheduleValue;
		}
	});

	nodecg.listenFor(Message.PreviousRun, (__, cb) => {
		setCurrentRun(currentRunRep.value.index - 1);
		if (cb && !cb.handled) {
			cb();
		}
	});

	nodecg.listenFor(Message.NextRun, (__, cb) => {
		const nextIndex = currentRunRep.value.index + 1;
		setCurrentRun(nextIndex);
		if (cb && !cb.handled) {
			cb();
		}
	});
};
