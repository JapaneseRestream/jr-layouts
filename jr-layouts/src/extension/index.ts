import {NodeCG} from './nodecg';
import {schedule} from './schedule';
import {twitch} from './twitch';

export = (nodecg: NodeCG) => {
	try {
		schedule(nodecg);
		twitch(nodecg);
	} catch (error) {
		nodecg.log.error('Failed to initialize extension');
		nodecg.log.error(error.stack);
	}
};
