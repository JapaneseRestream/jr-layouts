/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Twitch = {
	channelInfo: {
		ours: ChannelInfo;
		target: ChannelInfo;
	};
} | null;

export interface ChannelInfo {
	game: string;
	logo: string;
	title: string;
}
