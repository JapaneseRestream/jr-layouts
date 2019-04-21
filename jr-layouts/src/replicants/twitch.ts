export interface ChannelInfo {
	title: string;
	game: string;
	logo: string;
}

export interface Twitch {
	channelInfo: {
		target: ChannelInfo;
		ours: ChannelInfo;
	};
}
