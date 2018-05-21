const qs = require('querystring');
const ResetableInterval = require('./lib/resetable-interval');

module.exports = nodecg => {
	const {log} = nodecg;
	if (!nodecg.config.login || !nodecg.config.login.twitch) {
		log.info('Missing config to enable Twitch related feature');
		return;
	}

	const twitchAxios = require('./lib/twitch-axios')(
		nodecg.config.login.twitch.clientID
	);

	const targetChannelName = 'rpglimitbreak';
	const ourChannelName = 'japanese_restream';

	const targetChannelIdRep = nodecg.Replicant('targetChannelId');
	const ourChannelIdRep = nodecg.Replicant('ourChannelId');
	const targetChannelInfoRep = nodecg.Replicant('targetChannelInfo');
	const ourChannelInfoRep = nodecg.Replicant('ourChannelInfo');

	const channelIdRequestQuery = qs.stringify({
		login: `${targetChannelName},${ourChannelName}`,
	});
	twitchAxios
		.get(`users?${channelIdRequestQuery}`)
		.then(({data}) => {
			targetChannelIdRep.value = data.users[0]._id;
			ourChannelIdRep.value = data.users[1]._id;
		})
		.catch(err => {
			log.error(`Failed to get channel ID of ${targetChannelName}:`);
			log.error(err);
		});

	const fetchChannelInfo = (infoRep, channelId) => {
		twitchAxios
			.get(`channels/${channelId}`)
			.then(({data}) => {
				if (infoRep.value.title !== data.status) {
					infoRep.value.title = data.status || '';
				}
				if (infoRep.value.game !== data.game) {
					infoRep.value.game = data.game || '';
				}
			})
			.catch(err => {
				log.error(`Failed to get channel info:`);
				log.error(err);
			});
	};

	const targetInfoInterval = new ResetableInterval(fetchChannelInfo, 60 * 1000);
	targetChannelIdRep.on('change', newId => {
		targetInfoInterval.call(targetChannelInfoRep, newId);
		targetInfoInterval.reset(targetChannelInfoRep, newId);
	});

	const ourInfoInterval = new ResetableInterval(fetchChannelInfo, 60 * 1000);
	ourChannelIdRep.on('change', newId => {
		ourInfoInterval.call(ourChannelInfoRep, newId);
		ourInfoInterval.reset(ourChannelInfoRep, newId);
	});
};
