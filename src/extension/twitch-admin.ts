import axios from 'axios';

import {NodeCG} from './nodecg';

export const setupTwitchAdmin = (nodecg: NodeCG) => {
	if (!nodecg.config || !nodecg.config.login.twitch) {
		nodecg.log.warn(
			"Provide NodeCG's Twitch login to enable Twitch channel administration",
		);
		return;
	}

	const twitchConfig = nodecg.config.login.twitch;

	const hasEditorScope = twitchConfig.scope
		.split(' ')
		.includes('channel_editor');
	if (!hasEditorScope) {
		nodecg.log.error('Twitch API credential does not have channel_editor');
		return;
	}

	const twitchOauthRep = nodecg.Replicant('twitchOauth', {
		defaultValue: null,
	});

	// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
	const loginLib = require('nodecg/lib/login');
	loginLib.on('login', (session: any) => {
		const {user} = session.passport;
		if (
			user.privider !== 'twitch' ||
			user.username !== 'japanese_restream'
		) {
			return;
		}
		twitchOauthRep.value = {token: user.accessToken, channelId: user.id};
		nodecg.log.info(`Twitch admin is set up for ${user.username}`);
	});

	let lastUpdatedTitle = '';
	nodecg.Replicant('currentRun').on('change', async (newRun) => {
		try {
			if (!twitchOauthRep.value) {
				nodecg.log.warn(
					`You must login as japanese_restream to update Twitch status`,
				);
				return;
			}
			if (!newRun || !newRun.game) {
				nodecg.log.warn(
					'Current run is empty, not going to update Twitch status',
				);
				return;
			}
			if (lastUpdatedTitle === newRun.game) {
				return;
			}
			nodecg.log.info(`Updating Twitch status to ${newRun.game}`);
			lastUpdatedTitle = newRun.game;

			await axios.put(
				`https://api.twitch.tv/kraken/channels/${twitchOauthRep.value.channelId}`,
				{
					channel: {
						status: `[JPN] ESA Summer 2019: ${lastUpdatedTitle}`,
					},
				},
				{
					headers: {
						Accept: 'application/vnd.twitchtv.v5+json',
						Authorization: `OAuth ${twitchOauthRep.value.token}`,
						'Client-ID': twitchConfig.clientID,
						'Content-Type': 'application/json',
					},
				},
			);
		} catch (error) {
			nodecg.log.error('Failed to update Twitch status');
			nodecg.log.error(error.stack);
		}
	});

	let lastUpdatedGame = '';
	nodecg.Replicant('twitch').on('change', async (newVal) => {
		try {
			if (!twitchOauthRep.value) {
				nodecg.log.warn(
					`You must login as japanese_restream to update Twitch status`,
				);
				return;
			}
			const newGame = newVal && newVal.channelInfo.target.game;
			if (!newGame) {
				nodecg.log.warn(`New game status "${newGame}" is empty`);
				return;
			}
			if (newGame === lastUpdatedGame) {
				return;
			}
			lastUpdatedGame = newGame;
			await axios.put(
				`https://api.twitch.tv/kraken/channels/${twitchOauthRep.value.channelId}`,
				{
					channel: {
						game: lastUpdatedGame,
					},
				},
				{
					headers: {
						Accept: 'application/vnd.twitchtv.v5+json',
						Authorization: `OAuth ${twitchOauthRep.value.token}`,
						'Client-ID': twitchConfig.clientID,
						'Content-Type': 'application/json',
					},
				},
			);
		} catch (error) {
			nodecg.log.error('Failed to update Twitch status');
			nodecg.log.error(error.stack);
		}
	});

	// https://dev.twitch.tv/docs/api/reference/#create-stream-marker
	nodecg.listenFor('twitch:putMarker', async (_, cb) => {
		try {
			if (!twitchOauthRep.value) {
				nodecg.log.warn(
					`You must login as japanese_restream to put stream marker`,
				);
				return;
			}
			await axios.post(
				'https://api.twitch.tv/helix/streams/markers',
				{user_id: twitchOauthRep.value.channelId}, // eslint-disable-line camelcase,@typescript-eslint/camelcase
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `OAuth ${twitchOauthRep.value.token}`,
						'Client-ID': twitchConfig.clientID,
					},
				},
			);
			if (cb && !cb.handled) {
				return cb(null, false);
			}
		} catch (error) {
			nodecg.log.error('Failed to put marker on Twitch stream');
			if (cb && !cb.handled) {
				return cb(null, false);
			}
		}
	});
};
