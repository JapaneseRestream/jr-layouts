import {setInterval} from "timers";

import {google} from "googleapis";

import type {BundleConfig} from "../nodecg/bundle-config";

import type {NodeCG} from "./nodecg";

const UPDATE_INTERVAL = 10 * 1000;
const GAMES_DEMOS_ID = "66082";

export const setupSpreadsheet = async (nodecg: NodeCG) => {
	const {default: zipObject} = await import("lodash-es/zipObject.js");

	const config: BundleConfig = nodecg.bundleConfig;
	const GOOGLE_API_KEY = config.googleApiKey;
	const SPREADSHEET_ID = config.spreadsheetId;
	const spreadsheetRep = nodecg.Replicant("spreadsheet", {
		defaultValue: [],
	});
	const gameIdsRep = nodecg.Replicant("game-ids");
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
		if (gamesValue?.values) {
			const [labels, ...contents] = gamesValue.values;
			if (labels) {
				const games = contents.map((content) =>
					zipObject<string>(labels, content),
				);
				spreadsheetRep.value = games
					.map((g) => {
						return {
							title: g["title"] ?? "",
							category: g["category"] ?? "",
							platform: g["platform"] ?? "",
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
			if (idsValue?.values) {
				const [_label, ...contents] = idsValue.values;
				const idMap = contents.map((content) =>
					zipObject<string>(["name", "english", "id"], content),
				);
				gameIdsRep.value = idMap.map((idName) => {
					return {
						name: idName["name"] ?? "",
						gameId: idName["id"] ? idName["id"] : GAMES_DEMOS_ID,
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
