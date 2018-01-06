const request = require('superagent');

module.exports = nodecg => {
	const log = new nodecg.Logger(`${nodecg.bundleName}:twitch`);
	const targetChannelName = 'gamesdonequick';
	const targetChannelIdRep = nodecg.Replicant('targetChannelId', { defaultValue: '' });
	const targetChannelInfoRep = nodecg.Replicant('targetChannelInfo')

	if (
		!nodecg.config.login ||
		!nodecg.config.login.enabled ||
		!nodecg.config.login.twitch ||
		!nodecg.config.login.twitch.enabled
	) {
		log.info("Enable NodeCG's login feature to enable Twitch-related extensions");
		return;
	}
	
	const url = `https://api.twitch.tv/kraken/users?login=${targetChannelName}`
	request
		.get(url)
		.set('Accept', 'application/vnd.twitchtv.v5+json')
		.set('Client-ID', nodecg.config.login.twitch.clientID)
		.end((err, response) => {
			if (err) {
				log.error(`Failed to get channel ID of ${targetChannelName}:`);
				log.error(err);
			} else {
				targetChannelIdRep.value = response.body.users[0]._id
			}
		})
	
	let channelInfoInterval;
	targetChannelIdRep.on('change', newVal => {
		const retrieveChannelInfo = () => {
			const url = `https://api.twitch.tv/kraken/channels/${newVal}`;
			request
				.get(url)
				.set('Accept', 'application/vnd.twitchtv.v5+json')
				.set('Client-ID', nodecg.config.login.twitch.clientID)
				.end((err, response) => {
					if (err) {
						log.error(`Failed to get channel info from ${targetChannelName}:`);
						log.error(err);
					} else {
						const result = response.body;
						if (targetChannelInfoRep.value.title !== result.status) {
							targetChannelInfoRep.value.title = result.status;
						}
						if (targetChannelInfoRep.value.game !== result.game) {
							targetChannelInfoRep.value.game = result.game;
						}
					}
				})
		}
		retrieveChannelInfo();
		channelInfoInterval = setInterval(retrieveChannelInfo, 60 * 1000);
	})
}
