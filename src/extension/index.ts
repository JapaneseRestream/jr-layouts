import "source-map-support/register";
import {setupSpreadsheet} from "./spreadsheet";
import {setupSchedule} from "./schedule";
import {setupTwitchInfo} from "./twitch";
import {setupDiscord} from "./discord";
import type {NodeCG} from "./nodecg";
import {setupTwitchAdmin} from "./twitch-admin";
import {setupObs} from "./obs";

export = (nodecg: NodeCG) => {
	setupSpreadsheet(nodecg);
	setupSchedule(nodecg);
	void setupTwitchInfo(nodecg);
	void setupDiscord(nodecg);
	setupTwitchAdmin(nodecg);
	void setupObs(nodecg);
};
