export interface Run {
	index: number;
	scheduled: string;
	game: string;
	category: string;
	console: string;
	runners: string;
	english: string;
	commentator: string;
	runTime: string;
	setupTime: string;
}

export interface ChannelInfo {
	title: string;
	game: string;
	logo: string;
}

export type DiscordSpeakingStatus = {id: string; name: string}[];

export interface Spreadsheet {
	eventInfo?: {
		eventName: string;
		originalEventName: string;
		startTime: string;
		targetTwitchChannel: string;
		ourTwitchChannel: string;
		venue: string;
		timezoneDifference: number;
	};
	gamesList?: {
		originalTitle: string;
		title: string;
		originalCategory: string;
		category: string;
		commentators: string;
		platform: string;
		runDuration: string;
		setupDuration: string;
	}[];
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ReplicantMap = {
	currentRun: Run | null;
	discordSpeakingStatus: DiscordSpeakingStatus;
	schedule: Run[];
	spreadsheet: Spreadsheet;
	twitch: {
		channelInfo: {
			target: ChannelInfo;
			ours: ChannelInfo;
		};
	} | null;
	targetChannel: string;
	twitchOauth: {
		token: string;
		channelId: string;
	} | null;
};
