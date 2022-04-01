import "source-map-support/register";
import {setupSpreadsheet} from "./spreadsheet";
import {setupSchedule} from "./schedule";
import {setupDiscord} from "./discord";
import type {NodeCG} from "./nodecg";
import {setupTwitchAdmin} from "./twitch-admin";
import {setupObs} from "./obs";

export = (nodecg: NodeCG) => {
	setupTwitchAdmin(nodecg);
	setupSpreadsheet(nodecg);
	setupSchedule(nodecg);
	setupDiscord(nodecg);
	setupObs(nodecg);
};
