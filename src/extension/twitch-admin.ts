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
	const ourChannel =
		nodecg.bundleConfig.twitch && nodecg.bundleConfig.twitch.ourChannel;
	if (!ourChannel) {
		nodecg.log.warn('Twitch config is missing in bundle config');
		return;
	}

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
		if (user.provider !== 'twitch' || user.username !== ourChannel) {
			return;
		}
		twitchOauthRep.value = {token: user.accessToken, channelId: user.id};
		nodecg.log.info(`Twitch admin is set up for ${user.username}`);
	});

	let lastUpdatedTitle = '';
	nodecg.Replicant('currentRun').on('change', async (newRun) => {
		try {
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
			if (!twitchOauthRep.value) {
				nodecg.log.warn(
					`You must login as ${ourChannel} to update Twitch status`,
				);
				return;
			}
			await axios
				.put(
					`https://api.twitch.tv/kraken/channels/${twitchOauthRep.value.channelId}`,
					{
						channel: {
							status: `[JPN] ESA Summer 2019: ${newRun.game}`,
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
				)
				.then(() => {
					lastUpdatedTitle = newRun.game;
				});
		} catch (error) {
			nodecg.log.error('Failed to update Twitch status');
			nodecg.log.error(error);
		}
	});

	let lastUpdatedGame = '';
	nodecg.Replicant('twitch').on('change', async (newVal) => {
		try {
			const newGame = newVal && newVal.channelInfo.target.game;
			if (!newGame) {
				nodecg.log.warn(`New game status "${newGame}" is empty`);
				return;
			}
			if (newGame === lastUpdatedGame) {
				return;
			}
			if (!twitchOauthRep.value) {
				nodecg.log.warn(
					`You must login as ${ourChannel} to update Twitch status`,
				);
				return;
			}
			await axios
				.put(
					`https://api.twitch.tv/kraken/channels/${twitchOauthRep.value.channelId}`,
					{
						channel: {
							game: newGame,
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
				)
				.then(() => {
					lastUpdatedGame = newGame;
				});
		} catch (error) {
			nodecg.log.error('Failed to update Twitch status');
			nodecg.log.error(error);
		}
	});

	const lastMarkerTimeRep = nodecg.Replicant('lastMarkerTime');
	// https://dev.twitch.tv/docs/api/reference/#create-stream-marker
	nodecg.listenFor('twitch:putMarker', async (_, cb) => {
		try {
			if (!twitchOauthRep.value) {
				nodecg.log.warn(
					`You must login as ${ourChannel} to put stream marker`,
				);
				if (cb && !cb.handled) {
					return cb(null, true);
				}
				return;
			}
			await axios.post(
				'https://api.twitch.tv/helix/streams/markers',
				{user_id: twitchOauthRep.value.channelId}, // eslint-disable-line camelcase,@typescript-eslint/camelcase
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${twitchOauthRep.value.token}`,
						'Client-ID': twitchConfig.clientID,
					},
				},
			);
			lastMarkerTimeRep.value = Date.now();
			if (cb && !cb.handled) {
				return cb(null, true);
			}
		} catch (error) {
			nodecg.log.error('Failed to put marker on Twitch stream');
			nodecg.log.error(error);
			if (cb && !cb.handled) {
				return cb(null, false);
			}
		}
	});
};
