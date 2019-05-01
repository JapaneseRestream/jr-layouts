interface GamesListItem {
	originalTitle: string;
	title: string;
	originalCategory: string;
	category: string;
	commentators: string;
	platform: string;
	runDuration: string;
	setupDuration: string;
}

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
	gamesList?: GamesListItem[];
}
