import {setInterval} from 'timers';
import path from 'path';

import appRootPath from 'app-root-path';
import got from 'got';

import type {NodeCG} from './nodecg';

const UPDATE_INTERVAL = 10 * 1000;

export const setupTwitchInfo = async (nodecg: NodeCG) => {
	const logger = new nodecg.Logger(
		path.relative(appRootPath.path, __filename),
	);
	if (!nodecg.config.login?.twitch?.clientID) {
		logger.warn(
			"NodeCG config doesn't have Twitch configuration. jr-layouts can't fetch Twitch information.",
		);
		return;
	}
	const twitchConfig = nodecg.bundleConfig.twitch;
	if (!twitchConfig) {
		logger.warn('Bundle config does not have Twitch configuration');
		return;
	}

	const twitchRep = nodecg.Replicant('twitch', {
		defaultValue: null,
	});

	const twitchGot = got.extend({
		prefixUrl: 'https://api.twitch.tv',
		headers: {
			Accept: 'application/vnd.twitchtv.v5+json',
			'Client-ID': nodecg.config.login.twitch.clientID,
		},
		retry: 5,
	});

	const fetchChannelInfo = async (channelId: string) => {
		const {body} = await twitchGot.get<{
			status?: string;
			game?: string;
			logo?: string;
		}>(`/kraken/channels/${channelId}`);
		return {
			title: body.status ?? '',
			game: body.game ?? '',
			logo: body.logo ?? '',
		};
	};

	const {body} = await twitchGot.get<{users: {_id: string}[]}>(
		'/kraken/users',
		{
			searchParams: {
				login: `${twitchConfig.ourChannel},${twitchConfig.originalChannel}`,
			},
		},
	);

	const ourChannelId = body.users[0]._id; // eslint-disable-line no-underscore-dangle
	const targetChannelId = body.users[1]._id; // eslint-disable-line no-underscore-dangle

	setInterval(async () => {
		try {
			const [ourChannelInfo, targetChannelInfo] = await Promise.all([
				fetchChannelInfo(ourChannelId),
				fetchChannelInfo(targetChannelId),
			]);
			if (twitchRep.value) {
				twitchRep.value.channelInfo = {
					ours: ourChannelInfo,
					target: targetChannelInfo,
				};
			} else {
				twitchRep.value = {
					channelInfo: {
						ours: ourChannelInfo,
						target: targetChannelInfo,
					},
				};
			}
		} catch (error: unknown) {
			nodecg.log.error(`Failed to update Twitch channel info:`, error);
		}
	}, UPDATE_INTERVAL);
};
