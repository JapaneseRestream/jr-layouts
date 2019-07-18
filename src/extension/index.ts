import 'source-map-support/register';
import {setupSpreadsheet} from './spreadsheet';
import {setupSchedule} from './schedule';
import {setupTwitchInfo} from './twitch';
import {setupDiscord} from './discord';
import {NodeCG} from './nodecg';
import {setupTwitchAdmin} from './twitch-admin';

export = (nodecg: NodeCG) => {
	setupSpreadsheet(nodecg);
	setupSchedule(nodecg);
	setupTwitchInfo(nodecg);
	setupDiscord(nodecg);
	setupTwitchAdmin(nodecg);
};
