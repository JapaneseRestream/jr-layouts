import appRootPath from 'app-root-path';
import type {VoiceChannel} from 'discord.js';
import discord from 'discord.js';
import {isEqual} from 'lodash';

import type {BundleConfig} from '../nodecg/bundle-config';
import type {DiscordSpeakingStatus} from '../nodecg/generated/discord-speaking-status';

import type {NodeCG} from './nodecg';

export const setupDiscord = async (nodecg: NodeCG) => {
	const {discordToken, discordChannelId}: BundleConfig = nodecg.bundleConfig;
	if (!discordToken) {
		nodecg.log.warn('Discord token is empty');
		return;
	}
	if (!discordChannelId) {
		nodecg.log.warn('Discord channel ID is empty');
		return;
	}

	const speakingStatusRep = nodecg.Replicant('discordSpeakingStatus', {
		defaultValue: [],
		persistent: false,
	});

	const client = new discord.Client();
	await client.login(discordToken);

	client.on('ready', async () => {
		nodecg.log.info('Discord client is ready.');
		const liveChannel = await client.channels.fetch(discordChannelId);

		if (liveChannel.type !== 'voice') {
			nodecg.log.error(
				`Discord channel ${liveChannel.id} is not voice channel`,
			);
			return;
		}

		const voiceChannel = liveChannel as VoiceChannel;

		if (!voiceChannel.joinable) {
			nodecg.log.error(
				`Cannot join voice channel ${voiceChannel.name} (${voiceChannel.id})`,
			);
			return;
		}

		nodecg.log.info(`Joining channel ${voiceChannel.name}`);
		const connection = await voiceChannel.join();
		nodecg.log.info('Joined channel');
		connection.play(appRootPath.resolve('./assets/join.mp3'), {volume: 0});
		connection.on('speaking', (user, speaking) => {
			const member = voiceChannel.members.find((m) => m.id === user.id);
			if (!member) {
				return;
			}
			let newStatus: DiscordSpeakingStatus;
			const currentStatus = speakingStatusRep.value || [];
			if (speaking.bitfield === 1) {
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
							member.nickname ??
							member.displayName ??
							member.user?.username ??
							'',
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
			const filteredStatus = (
				speakingStatusRep.value || []
			).filter(({id}) =>
				voiceChannel.members.some((member) => member.id === id),
			);
			if (!isEqual(speakingStatusRep.value, filteredStatus)) {
				speakingStatusRep.value = filteredStatus;
			}
		}, 200);
	});
};
