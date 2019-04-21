import axios from 'axios';
import isEqual from 'lodash.isequal';
import {Replicant} from '../constants';
import {Twitch} from '../replicants/twitch';
import {NodeCG} from './nodecg';

const TWITCH_API_URL = 'https://api.twitch.tv';
const TWITCH_ACCEPT_TYPE = 'application/vnd.twitchtv.v5+json';
const UPDATE_INTERVAL = 10 * 1000; // 30 seconds

export const twitch = async (nodecg: NodeCG) => {
	if (
		!nodecg.config.login ||
		!nodecg.config.login.twitch ||
		!nodecg.bundleConfig.twitch
	) {
		nodecg.log.info(
			'Config misses required properties for Twitch features',
		);
		return;
	}

	const TARGET_CHANNEL = nodecg.bundleConfig.twitch.targetChannel;
	const OUR_CHANNEL = nodecg.bundleConfig.twitch.ourChannel;

	const twitchRep = nodecg.Replicant<Twitch>(Replicant.Twitch);
	const twitchAxios = axios.create({
		headers: {
			Accept: TWITCH_ACCEPT_TYPE,
			'Client-ID': nodecg.config.login.twitch.clientID,
		},
	});
	const fetchChannelId = async (): Promise<[string, string]> => {
		const url = new URL('/kraken/users', TWITCH_API_URL);
		url.searchParams.append(
			'login',
			[TARGET_CHANNEL, OUR_CHANNEL].join(','),
		);
		const {data} = await twitchAxios(url.toString());
		return [data.users[0]._id, data.users[1]._id];
	};

	try {
		const channelId = await fetchChannelId();
		setInterval(async () => {
			try {
				const [target, ours] = await Promise.all<{
					status: string | null;
					game: string | null;
					logo: string | null;
				}>(
					channelId.map(async (id) => {
						const url = new URL(
							`/kraken/channels/${id}`,
							TWITCH_API_URL,
						);
						const res = await twitchAxios.get(url.toString());
						return res.data;
					}),
				);
				const channelInfo = {
					target: {
						title: target.status || '',
						game: target.game || '',
						logo: target.logo || '',
					},
					ours: {
						title: ours.status || '',
						game: ours.game || '',
						logo: ours.logo || '',
					},
				};
				if (!isEqual(channelInfo, twitchRep.value.channelInfo)) {
					twitchRep.value.channelInfo = channelInfo;
				}
			} catch (error) {
				nodecg.log.error('Failed to update channel info');
				nodecg.log.error(error.stack);
			}
		}, UPDATE_INTERVAL);
	} catch (error) {
		nodecg.log.error('Failed to setup Twitch feature');
		nodecg.log.error(error.stack);
	}
};
