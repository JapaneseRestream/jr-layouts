import {setInterval} from 'timers';

import axios from 'axios';

import {NodeCG} from './nodecg';

const UPDATE_INTERVAL = 10 * 1000;

export const setupTwitchInfo = (nodecg: NodeCG) => {
	if (!nodecg.config.login || !nodecg.config.login.twitch) {
		nodecg.log.warn(
			"NodeCG config doesn't have Twitch configuration. jr-layouts can't fetch Twitch information.",
		);
		return;
	}
	const twitchConfig = nodecg.bundleConfig.twitch;
	if (!twitchConfig) {
		nodecg.log.warn('Bundle config does not have Twitch configuration');
		return;
	}

	const twitchRep = nodecg.Replicant('twitch', {
		defaultValue: null,
	});

	const twitchAxios = axios.create({
		baseURL: 'https://api.twitch.tv',
		headers: {
			Accept: 'application/vnd.twitchtv.v5+json',
			'Client-ID': nodecg.config.login.twitch.clientID,
		},
	});

	const fetchChannelInfo = async (channelId: string) => {
		const {data} = await twitchAxios.get(`/kraken/channels/${channelId}`);
		return {
			title: data.status || '',
			game: data.game || '',
			logo: data.logo || '',
		};
	};

	twitchAxios
		.get('/kraken/users', {
			params: {
				login: [
					twitchConfig.ourChannel,
					twitchConfig.originalChannel,
				].join(','),
			},
		})
		.then(({data}) => {
			const ourChannelId = data.users[0]._id; // eslint-disable-line no-underscore-dangle
			const targetChannelId = data.users[1]._id; // eslint-disable-line no-underscore-dangle

			setInterval(async () => {
				try {
					const [
						ourChannelInfo,
						targetChannelInfo,
					] = await Promise.all([
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
				} catch (error) {
					nodecg.log.error(`Failed to update Twitch channel info.`);
					nodecg.log.error(error.stack);
				}
			}, UPDATE_INTERVAL);
		});
};
