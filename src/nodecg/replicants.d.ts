import type {CurrentRun} from "./generated/current-run";
import type {Schedule} from "./generated/schedule";
import type {DiscordSpeakingStatus} from "./generated/discord-speaking-status";
import type {Spreadsheet} from "./generated/spreadsheet";
import type {Twitch} from "./generated/twitch";

export interface ChannelInfo {
	title: string;
	game: string;
	logo: string;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ReplicantMap = {
	currentRun: CurrentRun;
	discordSpeakingStatus: DiscordSpeakingStatus;
	schedule: Schedule;
	spreadsheet: Spreadsheet;
	twitch: Twitch;
	targetChannel: string;
	twitchOauth: {
		accessToken: string;
		refreshToken: string;
		channelId: string;
	} | null;
	lastMarkerTime: number;
	obsAutoRecording: boolean;
	hashtag: string;
};
