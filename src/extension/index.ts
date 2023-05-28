import {setupAws} from "./aws";
import {setupDiscord} from "./discord";
import type {NodeCG} from "./nodecg";
import {setupObs} from "./obs";
import {setupSchedule} from "./schedule";
import {setupSpreadsheet} from "./spreadsheet";
import {setupTwitchAdmin} from "./twitch-admin";

export = async (nodecg: NodeCG) => {
	await Promise.all([
		setupTwitchAdmin(nodecg),
		setupSpreadsheet(nodecg),
		setupSchedule(nodecg),
		setupDiscord(nodecg),
		setupObs(nodecg),
		setupAws(nodecg),
	]);
};
