import 'source-map-support/register';
import {setupSpreadsheet} from './spreadsheet';
import {setupSchedule} from './schedule';
import {setupTwitchInfo} from './twitch';
import {setupDiscord} from './discord';
import {NodeCG} from './nodecg';

module.exports = (nodecg: NodeCG) => {
	setupSpreadsheet(nodecg);
	setupSchedule(nodecg);
	setupTwitchInfo(nodecg);
	setupDiscord(nodecg);
};
