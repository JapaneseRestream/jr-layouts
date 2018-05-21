const axios = require('axios');

module.exports = clientId =>
	axios.create({
		baseURL: 'https://api.twitch.tv/kraken',
		headers: {
			Accept: 'application/vnd.twitchtv.v5+json',
			'Client-ID': clientId,
		},
	});
