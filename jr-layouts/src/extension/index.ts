import {NodeCG} from 'nodecg/types/server';
import {setupSpreadsheet} from './spreadsheet';
import {setupSchedule} from './schedule';

export = (nodecg: NodeCG) => {
	setupSpreadsheet(nodecg);
	setupSchedule(nodecg);
};
