import {setInterval} from "timers";

import {google, sheets_v4} from "googleapis";
import _ from "lodash";

import type {BundleConfig} from "../nodecg/bundle-config";

import type {NodeCG} from "./nodecg";

const UPDATE_INTERVAL = 10 * 1000;
const GAMES_DEMOS_ID = "66082";

export const setupSpreadsheet = (nodecg: NodeCG) => {
	const config: BundleConfig = nodecg.bundleConfig;
	const GOOGLE_API_KEY = config.googleApiKey;
	const SPREADSHEET_ID = config.spreadsheetId;
	const spreadsheetRep = nodecg.Replicant("spreadsheet", {
		defaultValue: {gamesList: []},
	});
	const gameIdsRep = nodecg.Replicant("gameIds");
	const sheets = google.sheets({version: "v4", auth: GOOGLE_API_KEY});

	const fetchSpreadsheet = async () => {
		const res = await sheets.spreadsheets.values.batchGet({
			spreadsheetId: SPREADSHEET_ID,
			ranges: ["games!A:C"],
		});
		const sheetValues = res.data.valueRanges;
		if (!sheetValues) {
			throw new Error(
				`Couldn't get values from the spreadsheet ${SPREADSHEET_ID}`,
			);
		}
		const [gamesValue] = sheetValues;
		if (gamesValue.values) {
			const [labels, ...contents] = gamesValue.values;
			const games = contents.map((content) => _.zipObject(labels, content));

			if (spreadsheetRep.value) {
				spreadsheetRep.value.gamesList = games
					.map((g) => {
						return {
							title: g.title ?? "",
							category: g.category ?? "",
							platform: g.platform ?? "",
							commentators: "",
						};
					})
					.filter((game) => game.title);
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
	setInterval(() => {
		fetchSpreadsheet().catch((error) => {
			nodecg.log.error(error);
		});
	}, UPDATE_INTERVAL);

	const gameIdSheetId = config.twitchGameIdMapSheetId;
	if (gameIdSheetId) {
		const fetchGameIdSheet = async () => {
			const res = await sheets.spreadsheets.values.batchGet({
				spreadsheetId: gameIdSheetId,
				ranges: ["main!A:C"],
			});
			const sheetValues = res.data.valueRanges;
			if (!sheetValues) {
				throw new Error(
					`Couldn't get game IDs from spreadsheet ${gameIdSheetId}`,
				);
			}
			const [idsValue] = sheetValues;
			if (idsValue.values) {
				const contents = idsValue.values.slice(1);
				gameIdsRep.value = contents.map((row) => {
					return {
						name: row[0],
						gameId: row[2] || GAMES_DEMOS_ID,
					};
				});
			}
		};

		fetchGameIdSheet().catch((error) => {
			nodecg.log.error(error);
		});

		setInterval(() => {
			fetchGameIdSheet().catch((error) => {
				nodecg.log.error(error);
			});
		}, UPDATE_INTERVAL);
	}
};
