import {NodeCG} from 'nodecg/types/server';
import {setupSpreadsheet} from './spreadsheet';
import {setupSchedule} from './schedule';
import {setupTwitchInfo} from './twitch';

export = (nodecg: NodeCG) => {
	setupSpreadsheet(nodecg);
	setupSchedule(nodecg);
	setupTwitchInfo(nodecg);
};
