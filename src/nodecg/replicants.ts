import type {AccessToken} from "@twurple/auth";

import type {
	ObsStatus,
	Spreadsheet,
	Schedule,
	CurrentRun,
	GameIds,
	DiscordLiveChannel,
} from "./generated";

export type ReplicantMap = {
	// Defined by schemas
	"current-run": CurrentRun;
	"discord-live-channel": DiscordLiveChannel;
	"game-ids": GameIds;
	"obs-status": ObsStatus;
	schedule: Schedule;
	spreadsheet: Spreadsheet;

	// Additional replicants
	lastMarkerTime: number;
	hashtag: string;
	twitchTitle: string;
	"twitch-oauth": AccessToken;
	targetTwitchChannel: string;
	targetTwitchChannelId: string;
};
