import {setInterval} from 'timers';
import _ from 'lodash';
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

	const twitchRep = nodecg.Replicant('twitch', {
		defaultValue: null,
	});
	const spreadsheetRep = nodecg.Replicant('spreadsheet', {defaultValue: {}});

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

	let updateInterval: NodeJS.Timeout;

	spreadsheetRep.on('change', async ({eventInfo}) => {
		try {
			if (!eventInfo) {
				return;
			}

			const {data} = await twitchAxios.get('/kraken/users', {
				params: {
					login: [
						eventInfo.ourTwitchChannel,
						eventInfo.targetTwitchChannel,
					].join(','),
				},
			});

			const ourChannelId = data.users[0]._id;
			const targetChannelId = data.users[1]._id;

			const updateChannelInfo = async () => {
				const [ourChannelInfo, targetChannelInfo] = await Promise.all([
					fetchChannelInfo(ourChannelId),
					fetchChannelInfo(targetChannelId),
				]);
				twitchRep.value = {
					...twitchRep.value,
					channelInfo: {
						ours: ourChannelInfo,
						target: targetChannelInfo,
					},
				};
			};

			clearInterval(updateInterval);
			updateInterval = setInterval(async () => {
				try {
					await updateChannelInfo();
				} catch (error) {
					nodecg.log.error(`Failed to update Twitch channel info.`);
					nodecg.log.error(error.stack);
				}
			}, UPDATE_INTERVAL);
		} catch (error) {
			nodecg.log.error(
				'Failed to setup periodical fetching of Twitch channel info.',
			);
			nodecg.log.error(error.stack);
		}
	});
};
