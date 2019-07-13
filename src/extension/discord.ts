import discord from 'discord.js';
import {isEqual} from 'lodash';
import {BundleConfig} from '../nodecg/bundle-config';
import {DiscordSpeakingStatus} from '../nodecg/replicants';
import {NodeCG} from './nodecg';

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
	if (discordToken === '') {
		nodecg.log.warn('Discord token is empty');
		return;
	}

	const speakingStatusRep = nodecg.Replicant('discordSpeakingStatus', {
		defaultValue: [],
		persistent: false,
	});

	const client = new discord.Client();
	await client.login(discordToken);
	const liveChannel = findLiveChannel(
		client.channels,
		'解説（放送にのります）',
	);
	await liveChannel.join();
	client.on('guildMemberSpeaking', (member, speaking) => {
		let newStatus: DiscordSpeakingStatus;
		const currentStatus = speakingStatusRep.value || [];
		if (speaking) {
			const alreadySpeaking = currentStatus.some(
				(speakingMember) => speakingMember.id === member.id,
			);
			if (alreadySpeaking) {
				return;
			}
			newStatus = [
				...currentStatus,
				{
					id: member.id,
					name:
						member.nickname ||
						member.displayName ||
						member.user.username,
				},
			];
		} else {
			newStatus = currentStatus.filter(
				(speakingMember) => speakingMember.id !== member.id,
			);
		}
		speakingStatusRep.value = newStatus;
	});

	setInterval(() => {
		const filteredStatus = (speakingStatusRep.value || []).filter(({id}) =>
			liveChannel.members.some((member) => member.id === id),
		);
		if (!isEqual(speakingStatusRep.value, filteredStatus)) {
			speakingStatusRep.value = filteredStatus;
		}
	}, 200);
};
