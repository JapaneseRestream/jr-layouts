import * as dateFns from 'date-fns';
import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';
import zipObject from 'lodash.zipobject';
import {google} from 'googleapis';
import * as Joi from 'joi';
import {Message, Replicant} from '../constants';
import {CurrentRun} from '../replicants/current-run';
import {Schedule} from '../replicants/schedule';
import {Run} from '../replicants/lib';
import {BundleConfig} from '../bundle-config';
import {NodeCG} from './nodecg';

const UPDATE_INTERVAL = 60 * 1000; // 1 minute

const durationRegex = /^(\d+):(\d\d):(\d\d)$/u;

const stringSchema = () =>
	Joi.string()
		.allow('')
		.default('');
const durationSchema = () =>
	Joi.string()
		.allow('')
		.regex(durationRegex)
		.default('0:00:00');

const sheetValueSchema = Joi.array().items(
	Joi.object().keys({
		game: stringSchema(),
		english: stringSchema(),
		category: stringSchema(),
		commentator: stringSchema(),
		runners: stringSchema(),
		runTime: durationSchema(),
		setupTime: durationSchema(),
	}),
);

const addDuration = (date: Date, duration: string) => {
	let resultDate = date;
	const matched = duration.match(durationRegex);
	if (!matched) {
		throw new Error('Duration string is invalid');
	}
	resultDate = dateFns.addHours(resultDate, parseInt(matched[1], 10));
	resultDate = dateFns.addMinutes(resultDate, parseInt(matched[2], 10));
	resultDate = dateFns.addSeconds(resultDate, parseInt(matched[3], 10));
	return resultDate;
};

export const schedule = (nodecg: NodeCG) => {
	const config: BundleConfig = nodecg.bundleConfig;
	const GOOGLE_API_KEY = config.googleApiKey;
	const SPREADSHEET_ID = config.spreadsheetId;

	const scheduleRep = nodecg.Replicant<Schedule>(Replicant.Schedule);
	const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);

	const sheets = google.sheets({version: 'v4', auth: GOOGLE_API_KEY});

	const fetchSchedule = async () => {
		const res = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
		});
		const sheetValues = res.data.values;
		if (!sheetValues) {
			throw new Error(`Spreadsheet ${SPREADSHEET_ID} values are empty`);
		}
		const [labels] = sheetValues;
		const formattedValue = sheetValues
			.slice(1)
			.map((value: (string | undefined)[]) => zipObject(labels, value));
		const result = Joi.attempt(formattedValue, sheetValueSchema);

		let startTime = new Date(0);
		return result.map((value, index) => {
			const valueWithStartTime: Run = {
				...(value as any),
				scheduled: startTime.toISOString(),
				index,
			};
			startTime = addDuration(startTime, value.runTime || '0:00:00');
			startTime = addDuration(startTime, value.setupTime || '0:00:00');
			return valueWithStartTime;
		});
	};
	const applyLatestSchedule = async () => {
		const latestSchedule = await fetchSchedule();
		const updated = !isEqual(latestSchedule, scheduleRep.value);
		if (updated) {
			scheduleRep.value = latestSchedule;
		}
	};
	const applyCurrentRun = (index: number) => {
		if (index < 0 && index > scheduleRep.value.length - 1) {
			throw new Error(
				'Invalid index for schedule when applying currentRun',
			);
		}
		const runToApply = scheduleRep.value[index];
		if (!runToApply) {
			throw new Error('Invalid run to apply to currentRun');
		}
		currentRunRep.value = cloneDeep(runToApply);
	};
	const setupScheduleInterval = () =>
		setInterval(async () => {
			try {
				await applyLatestSchedule();
			} catch (error) {
				nodecg.log.error(error.stack);
			}
		}, UPDATE_INTERVAL);

	let updateScheduleTimer = setupScheduleInterval();
	scheduleRep.on('change', () => {
		try {
			if (currentRunRep.value.index === undefined) {
				applyCurrentRun(0);
			}
		} catch (error) {
			nodecg.log.error(error.stack);
		}
	});
	nodecg.listenFor(Message.UpdateSchedule, async (_message, cb) => {
		try {
			clearInterval(updateScheduleTimer);
			await applyLatestSchedule();
		} catch (error) {
			nodecg.log.error(error.stack);
			if (cb && !cb.handled) {
				cb(error);
			}
		} finally {
			updateScheduleTimer = setupScheduleInterval();
		}
	});
	nodecg.listenFor(Message.PreviousRun, (_message, cb) => {
		try {
			const currentIndex = currentRunRep.value.index || 0;
			const previousIndex = currentIndex - 1;
			applyCurrentRun(previousIndex);
		} catch (error) {
			nodecg.log.error(error.stack);
			if (cb && !cb.handled) {
				cb(error);
			}
		}
	});
	nodecg.listenFor(Message.NextRun, (_message, cb) => {
		try {
			const currentIndex = currentRunRep.value.index || 0;
			const nextIndex = currentIndex + 1;
			applyCurrentRun(nextIndex);
		} catch (error) {
			nodecg.log.error(error.stack);
			if (cb && !cb.handled) {
				cb(error);
			}
		}
	});

	applyLatestSchedule();
};
