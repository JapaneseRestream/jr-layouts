type EmptyObject = Record<string, unknown>;

export type MessageMap = {
	previousRun: EmptyObject;
	nextRun: EmptyObject;
	updateSpreadsheet: EmptyObject;
	refreshPlayer: EmptyObject;
	"twitch:putMarker": {result: boolean};
	"obs:take-screenshot": {result: string};
	"obs:connect": EmptyObject;
	startStreamPc: EmptyObject;
	stopStreamPc: EmptyObject;
	refreshDiscordBot: EmptyObject;
};
