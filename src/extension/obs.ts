import OBSWebSocket from 'obs-websocket-js';

import type {NodeCG} from './nodecg';

const obs = new OBSWebSocket();

export const setupObs = (nodecg: NodeCG) => {
	const {obs: obsConfig} = nodecg.bundleConfig;

	if (!obsConfig) {
		nodecg.log.warn('OBS setting is empty');
		return;
	}

	void obs.connect(obsConfig, (error) => {
		if (error) {
			nodecg.log.error('Failed to connect to OBS:', error);
		}
	});

	nodecg.listenFor('obs:take-screenshot', async (_, cb) => {
		try {
			const {name} = await obs.send('GetCurrentScene');
			const {img} = await obs.send('TakeSourceScreenshot', {
				sourceName: name,
				embedPictureFormat: 'png',
			});
			if (cb && !cb.handled) {
				cb(null, img);
				return;
			}
		} catch (error: unknown) {
			if (cb && !cb.handled) {
				cb('Failed to take screenshot of OBS');
				return;
			}
			nodecg.log.error('Failed to take screenshot of OBS:', error);
		}
	});
};
