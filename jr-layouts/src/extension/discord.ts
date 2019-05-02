import discord from 'discord.js';
import {NodeCG} from 'nodecg/types/server';
import {BundleConfig} from '../bundle-config';
import {DiscordSpeakingStatus} from '../replicants/discord-speaking-status';
import {Replicant} from '../constants';

const findLiveChannel = (
	channelCollection: discord.Collection<string, discord.Channel>,
	targetChannelName: string,
) => {
	for (const [, channel] of channelCollection) {
		if (
			channel instanceof discord.VoiceChannel &&
			channel.name === targetChannelName
		) {
			return channel;
		}
	}
	throw new Error(`Live voice channel not found: ${targetChannelName}`);
};

export const setupDiscord = async (nodecg: NodeCG) => {
	const {discordToken}: BundleConfig = nodecg.bundleConfig;
	const speakingStatusRep = nodecg.Replicant<DiscordSpeakingStatus>(
		Replicant.DiscordSpeakingStatus,
		{defaultValue: [], persistent: false},
	);

	const client = new discord.Client();
	await client.login(discordToken);
	const liveChannel = findLiveChannel(
		client.channels,
		'解説（放送にのります）',
	);
	await liveChannel.join();
	client.on('guildMemberSpeaking', (member, speaking) => {
		if (speaking) {
			const alreadySpeaking = speakingStatusRep.value.some(
				(speakingMember) => speakingMember.id === member.id,
			);
			if (alreadySpeaking) {
				return;
			}
			speakingStatusRep.value = [
				...speakingStatusRep.value,
				{
					id: member.id,
					name:
						member.nickname ||
						member.displayName ||
						member.user.username,
				},
			];
		} else {
			speakingStatusRep.value = speakingStatusRep.value.filter(
				(speakingMember) => speakingMember.id !== member.id,
			);
		}
	});
};
