export interface ChannelInfo {
	title: string;
	game: string;
	logo: string;
}

export type Twitch = {
	channelInfo: {
		target: ChannelInfo;
		ours: ChannelInfo;
	};
} | null;
