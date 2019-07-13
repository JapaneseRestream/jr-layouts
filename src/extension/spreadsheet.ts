import {setInterval} from 'timers';
import {google} from 'googleapis';
import _ from 'lodash';
import Joi from 'joi';
import {BundleConfig} from '../nodecg/bundle-config';
import {Spreadsheet} from '../nodecg/replicants';
import {NodeCG} from './nodecg';

const UPDATE_INTERVAL = 60 * 1000;

const durationRegex = /^\d+:[0-5]\d:[0-5]\d$/u;
const stringSchema = () =>
	Joi.string()
		.allow('')
		.default('');
const durationSchema = () =>
	Joi.string()
		.regex(durationRegex)
		.default('0:00:00');
const timeSchema = () =>
	Joi.string()
		.isoDate()
		.default(new Date(0).toISOString());
const eventInfoSchema = Joi.object({
	eventName: stringSchema(),
	originalEventName: stringSchema(),
	startTime: timeSchema(),
	targetTwitchChannel: stringSchema(),
	ourTwitchChannel: stringSchema(),
	venue: stringSchema(),
	timezoneDifference: Joi.number()
		.integer()
		.max(36)
		.min(-36)
		.default(0),
});
const gamesListSchema = Joi.array().items(
	Joi.object({
		originalTitle: stringSchema().required(),
		title: stringSchema(),
		originalCategory: stringSchema(),
		category: stringSchema(),
		commentators: stringSchema(),
		platform: stringSchema(),
		runDuration: durationSchema(),
		setupDuration: durationSchema(),
	}),
);

export const setupSpreadsheet = (nodecg: NodeCG) => {
	const config: BundleConfig = nodecg.bundleConfig;
	const GOOGLE_API_KEY = config.googleApiKey;
	const SPREADSHEET_ID = config.spreadsheetId;
	const spreadsheetRep = nodecg.Replicant('spreadsheet', {defaultValue: {}});
	const sheets = google.sheets({version: 'v4', auth: GOOGLE_API_KEY});

	const fetchSpreadsheet = async () => {
		const res = await sheets.spreadsheets.values.batchGet({
			spreadsheetId: SPREADSHEET_ID,
			ranges: ['info!A:B', 'games!A:H'],
		});
		const sheetValues = res.data.valueRanges;
		if (!sheetValues) {
			throw new Error(
				`Couldn't get values from the spreadsheet ${SPREADSHEET_ID}`,
			);
		}
		const [infoValue, gamesValue] = sheetValues;
		if (infoValue.values) {
			const info = _.fromPairs(infoValue.values);
			const {error, value} = Joi.validate(info, eventInfoSchema);
			if (error) {
				nodecg.log.error(
					`Invalid event info spreadsheet values: ${error.message}`,
				);
			} else {
				spreadsheetRep.value = {
					...spreadsheetRep.value,
					eventInfo: value as Spreadsheet['eventInfo'],
				};
			}
		} else {
			nodecg.log.error("Couldn't get event info values from spreadsheet");
		}
		if (gamesValue.values) {
			const [labels, ...contents] = gamesValue.values;
			const games = contents.map((content) =>
				_.zipObject(labels, content),
			);
			const {error, value} = Joi.validate(games, gamesListSchema);
			if (error) {
				nodecg.log.error(
					`Invalid games list spreadsheet values: ${error.message}`,
				);
			} else {
				spreadsheetRep.value = {
					...spreadsheetRep.value,
					gamesList: value as Spreadsheet['gamesList'],
				};
			}
		} else {
			nodecg.log.error("Couldn't get games list values from spreadsheet");
		}
	};

	// Initially fetch spreadsheet
	fetchSpreadsheet().catch((error) => {
		nodecg.log.error(error);
	});

	// Periodicaly fetch spreadsheet
	let interval: NodeJS.Timeout;
	const startPeriodicalFetch = () => {
		interval = setInterval(() => {
			fetchSpreadsheet().catch((error) => {
				nodecg.log.error(error);
			});
		}, UPDATE_INTERVAL);
	};
	startPeriodicalFetch();

	// Force update
	nodecg.listenFor('updateSpreadsheet', async () => {
		try {
			await fetchSpreadsheet();
		} catch (error) {
			nodecg.log.error(error);
		} finally {
			clearInterval(interval);
			startPeriodicalFetch();
		}
	});
};
