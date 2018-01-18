const request = require('superagent');

module.exports = nodecg => {
	const log = new nodecg.Logger(`${nodecg.bundleName}:twitch`);
	const targetChannelName = 'gamesdonequick';
	const targetChannelIdRep = nodecg.Replicant('targetChannelId', {
		defaultValue: ''
	});
	const ourChannelIdRep = nodecg.Replicant('ourChannelId', {
		defaultValue: ''
	});
	const targetChannelInfoRep = nodecg.Replicant('targetChannelInfo');
	const ourChannelInfoRep = nodecg.Replicant('ourChannelInfo');

	if (
		!nodecg.config.login ||
		!nodecg.config.login.enabled ||
		!nodecg.config.login.twitch ||
		!nodecg.config.login.twitch.enabled
	) {
		log.info(
			'Enable NodeCG\'s login feature to enable Twitch-related extensions'
		);
		return;
	}

	const getUrl = name => `https://api.twitch.tv/kraken/users?login=${name}`;
	const targetChannelRequest = request
		.get(getUrl(targetChannelName))
		.set('Accept', 'application/vnd.twitchtv.v5+json')
		.set('Client-ID', nodecg.config.login.twitch.clientID);
	const jpRestreamChannelRequest = request
		.get(getUrl('japanese_restream'))
		.set('Accept', 'application/vnd.twitchtv.v5+json')
		.set('Client-ID', nodecg.config.login.twitch.clientID);
	Promise.all([targetChannelRequest, jpRestreamChannelRequest])
		.then(([target, ours]) => {
			targetChannelIdRep.value = target.body.users[0]._id;
			ourChannelIdRep.value = ours.body.users[0]._id;
		})
		.catch(err => {
			log.error(`Failed to get channel ID of ${targetChannelName}:`);
			log.error(err);
		});

	const getChannelInfo = (channelIdRep, channelInfoRep, interval) => {
		channelIdRep.on('change', newVal => {
			const retrieveChannelInfo = () => {
				const url = `https://api.twitch.tv/kraken/channels/${newVal}`;
				request
					.get(url)
					.set('Accept', 'application/vnd.twitchtv.v5+json')
					.set('Client-ID', nodecg.config.login.twitch.clientID)
					.end((err, response) => {
						if (err) {
							log.error(
								`Failed to get channel info from ${targetChannelName}:`
							);
							log.error(err);
						} else {
							const result = response.body;
							if (channelInfoRep.value.title !== result.status) {
								channelInfoRep.value.title = result.status || '';
							}
							if (channelInfoRep.value.game !== result.game) {
								channelInfoRep.value.game = result.game || '';
							}
						}
					});
			};
			retrieveChannelInfo();
			clearInterval(interval);
			interval = setInterval(retrieveChannelInfo, 60 * 1000);
		});
	};

	let channelInfoInterval;
	getChannelInfo(targetChannelIdRep, targetChannelInfoRep, channelInfoInterval);
	getChannelInfo(ourChannelIdRep, ourChannelInfoRep, channelInfoInterval);
};
