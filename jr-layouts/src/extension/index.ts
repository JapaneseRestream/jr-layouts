import 'source-map-support/register';
import {NodeCG} from 'nodecg/types/server';
import {setupSpreadsheet} from './spreadsheet';
import {setupSchedule} from './schedule';
import {setupTwitchInfo} from './twitch';
import {setupDiscord} from './discord';

export = (nodecg: NodeCG) => {
	setupSpreadsheet(nodecg);
	setupSchedule(nodecg);
	setupTwitchInfo(nodecg);
	setupDiscord(nodecg);
};
