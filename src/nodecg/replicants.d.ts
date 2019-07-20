import {CurrentRun} from './generated/current-run';
import {Schedule} from './generated/schedule';
import {DiscordSpeakingStatus} from './generated/discord-speaking-status';
import {Spreadsheet} from './generated/spreadsheet';
import {Twitch} from './generated/twitch';

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
};
