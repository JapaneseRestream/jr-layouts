import got from 'got';
import appRootPath from 'app-root-path';

import {CurrentRun} from '../nodecg/generated/current-run';
import {Twitch} from '../nodecg/generated/twitch';

import {NodeCG} from './nodecg';

export const setupTwitchAdmin = (nodecg: NodeCG) => {
	const log = new nodecg.Logger('extension:twitch-admin');

	if (!nodecg.config || !nodecg.config.login.twitch) {
		log.error("Missing NodeCG's Twitch config");
		return;
	}

	const bundleTwitchConfig = nodecg.bundleConfig.twitch;

	if (!bundleTwitchConfig) {
		log.error("Missing bundle's Twitch config");
		return;
	}

	const twitchConfig = nodecg.config.login.twitch;

	if (!twitchConfig.scope.split(' ').includes('channel_editor')) {
		log.error('Missing `channel_editor` scope');
		return;
	}

	const twitchOauthRep = nodecg.Replicant('twitchOauth', {
		defaultValue: null,
	});
	const currentRunRep = nodecg.Replicant('currentRun');
	const twitchRep = nodecg.Replicant('twitch');
	const lastMarkerTimeRep = nodecg.Replicant('lastMarkerTime');
	// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
	const {clientSecret} = appRootPath.require(
		'./.nodecg/cfg/nodecg.json',
	).login.twitch; //

	const refreshToken = async () => {
		try {
			if (!twitchOauthRep.value) {
				return;
			}
			/* eslint-disable camelcase,@typescript-eslint/camelcase */
			const {body} = await got.post('https://id.twitch.tv/oauth2/token', {
				form: true,
				body: {
					grant_type: 'refresh_token',
					refresh_token: twitchOauthRep.value.refreshToken,
					client_id: twitchConfig.clientID,
					client_secret: clientSecret,
					scope: twitchConfig.scope,
				},
			});

			const response = JSON.parse(body);

			twitchOauthRep.value.accessToken = response.access_token;
			twitchOauthRep.value.refreshToken = response.refresh_token;
			/* eslint-enable camelcase,@typescript-eslint/camelcase */
			log.info('Successfully refreshed token');
		} catch (error) {
			log.error('Failed to refresh Twitch token:', error.message);
		}
	};

	let lastUpdatedTitle = '';
	let titleRetryCount = 0;
	const updateTitle = async (newRun: CurrentRun) => {
		try {
			if (!newRun || !newRun.game) {
				return;
			}
			if (lastUpdatedTitle === newRun.game) {
				return;
			}
			if (!twitchOauthRep.value) {
				log.error('Missing twitchOauth replicant, not updating title');
				return;
			}
			await got.put(
				`https://api.twitch.tv/kraken/channels/${twitchOauthRep.value.channelId}`,
				{
					json: true,
					body: {
						channel: {
							status: `[JPN] GDQx 2019: ${newRun.game}`,
						},
					},
					headers: {
						Accept: 'application/vnd.twitchtv.v5+json',
						Authorization: `OAuth ${twitchOauthRep.value.accessToken}`,
						'Client-ID': twitchConfig.clientID,
					},
				},
			);
			titleRetryCount = 0;
			lastUpdatedTitle = newRun.game;
			log.info(`Updated title to ${lastUpdatedTitle}`);
		} catch (error) {
			log.error('Failed to update title:', error.message);
			if (titleRetryCount >= 1) {
				log.error('not retrying');
				titleRetryCount = 0;
				return;
			}
			log.error('retrying');
			titleRetryCount += 1;
			await refreshToken();
			await updateTitle(newRun);
		}
	};
	currentRunRep.on('change', updateTitle);

	let lastUpdatedGame = '';
	let gameRetryCount = 0;
	const updateGame = async (newVal: Twitch) => {
		try {
			const newGame = newVal && newVal.channelInfo.target.game;
			if (!newGame) {
				return;
			}
			if (newGame === lastUpdatedGame) {
				return;
			}
			if (!twitchOauthRep.value) {
				log.error('Missing twitchOauth replicant, not updating game');
				return;
			}
			await got.put(
				`https://api.twitch.tv/kraken/channels/${twitchOauthRep.value.channelId}`,
				{
					json: true,
					body: {channel: {game: newGame}},
					headers: {
						Accept: 'application/vnd.twitchtv.v5+json',
						Authorization: `OAuth ${twitchOauthRep.value.accessToken}`,
						'Client-ID': twitchConfig.clientID,
					},
				},
			);
			gameRetryCount = 0;
			lastUpdatedGame = newGame;
			log.info(`Updated game to ${lastUpdatedGame}`);
		} catch (error) {
			log.error('Failed to update Twitch status:', error.message);
			if (gameRetryCount >= 1) {
				log.error('not retrying');
				gameRetryCount = 0;
				return;
			}
			log.error('retrying');
			gameRetryCount += 1;
			await refreshToken();
			await updateGame(newVal);
		}
	};
	twitchRep.on('change', updateGame);

	let markerRetryCount = 0;
	/**
	 * https://dev.twitch.tv/docs/api/reference/#create-stream-marker
	 */
	const putMarker = async (): Promise<boolean> => {
		try {
			if (!twitchOauthRep.value) {
				log.warn('Missing twitchOauth replicant, not putting marker');
				return false;
			}
			await got.post('https://api.twitch.tv/helix/streams/markers', {
				json: true,
				body: {
					user_id: twitchOauthRep.value.channelId, // eslint-disable-line camelcase,@typescript-eslint/camelcase
				},
				headers: {
					Authorization: `Bearer ${twitchOauthRep.value.accessToken}`,
					'Client-ID': twitchConfig.clientID,
				},
			});
			markerRetryCount = 0;
			const now = Date.now();
			lastMarkerTimeRep.value = now;
			log.info(`Put marker at ${new Date(now).toISOString()}`);
			return true;
		} catch (error) {
			log.error('Failed to put marker on Twitch stream:', error.message);
			if (markerRetryCount >= 1) {
				log.error('not retrying');
				markerRetryCount = 0;
				return false;
			}
			log.error('retrying');
			markerRetryCount += 1;
			await refreshToken();
			return putMarker();
		}
	};
	nodecg.listenFor('twitch:putMarker', async (_, cb) => {
		try {
			const success = await putMarker();
			if (cb && !cb.handled) {
				return cb(null, success);
			}
		} catch (error) {
			if (cb && !cb.handled) {
				return cb(null, false);
			}
		}
	});

	// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
	const loginLib = appRootPath.require('./.nodecg/lib/login');
	loginLib.on('login', (session: any) => {
		const {user} = session.passport;
		if (
			user.provider !== 'twitch' ||
			user.username !== bundleTwitchConfig.ourChannel
		) {
			return;
		}
		twitchOauthRep.value = {
			accessToken: user.accessToken,
			refreshToken: user.refreshToken,
			channelId: user.id,
		};
		log.info(`Set up for ${user.username}`);
		if (currentRunRep.value) {
			updateTitle(currentRunRep.value);
		}
		if (twitchRep.value) {
			updateGame(twitchRep.value);
		}
	});
};
