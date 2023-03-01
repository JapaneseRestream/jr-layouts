import type {AccessToken} from "@twurple/auth";

import type {
	ObsStatus,
	Spreadsheet,
	DiscordSpeakingStatus,
	Schedule,
	CurrentRun,
	Twitch,
	GameIds,
} from "./generated";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ReplicantMap = {
	// Defined by schemas
	currentRun: CurrentRun;
	discordSpeakingStatus: DiscordSpeakingStatus;
	obsStatus: ObsStatus;
	schedule: Schedule;
	spreadsheet: Spreadsheet;
	twitch: Twitch;
	gameIds: GameIds;

	// Additional replicants
	twitchOauth: AccessToken;
	lastMarkerTime: number;
	obsRecordingTimestamp: number;
	obsAutoRecording: boolean;
	hashtag: string;
	twitchTitle: string;
};
