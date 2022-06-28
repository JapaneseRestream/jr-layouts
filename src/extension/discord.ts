import path from "path";
import os from "os";

import appRootPath from "app-root-path";
import type {VoiceChannel} from "discord.js";
import discord from "discord.js";
import {isEqual} from "lodash";

import type {DiscordSpeakingStatus} from "../nodecg/generated/discord-speaking-status";

import type {NodeCG} from "./nodecg";
import {obs} from "./obs";

const tmpDir = os.tmpdir();
const screenshotPath = path.join(tmpDir, "obs-screenshot.png");

const takeScreenshot = async () => {
	const {name} = await obs.send("GetCurrentScene");
	const {img} = await obs.send("TakeSourceScreenshot", {
		sourceName: name,
		embedPictureFormat: "png",
		fileFormat: "png",
		saveToFilePath: screenshotPath,
	});
	return img;
};

export const setupDiscord = (nodecg: NodeCG) => {
	if (!nodecg.bundleConfig.discord) {
		nodecg.log.warn("Discord settings are empty");
		return;
	}

	const {
		token,
		voiceChannelId,
		screenshotChannelId,
	} = nodecg.bundleConfig.discord;

	const speakingStatusRep = nodecg.Replicant("discordSpeakingStatus", {
		defaultValue: [],
		persistent: false,
	});

	let client: discord.Client;
	let updateTimer: NodeJS.Timer;

	const initialize = async () => {
		try {
			if (client) {
				client.destroy();
			}
			if (updateTimer) {
				clearInterval(updateTimer);
			}

			client = new discord.Client();
			await client.login(token);

			nodecg.listenFor("obs:take-screenshot", async (_, cb) => {
				try {
					const img = await takeScreenshot();
					if (screenshotChannelId) {
						const screenshotChannel = await client.channels.fetch(
							screenshotChannelId,
						);
						if (screenshotChannel?.isText()) {
							await screenshotChannel.send({
								files: [{attachment: screenshotPath}],
							});
						}
					}
					if (cb && !cb.handled) {
						cb(null, img);
						return;
					}
				} catch (error: unknown) {
					if (cb && !cb.handled) {
						cb("Failed to take screenshot");
						return;
					}
					nodecg.log.error("Failed to take screenshot:", error);
				}
			});

			client.on("disconnect", () => {
				void initialize();
			});
			client.on("error", (error) => {
				nodecg.log.error("Discord client error:", error);
				void initialize();
			});
			client.on("invalidated", () => {
				nodecg.log.error("Discord client invalidated");
				void initialize();
			});
			client.on("warn", (warn) => {
				nodecg.log.warn("Discord client warning:", warn);
			});

			client.on("ready", async () => {
				nodecg.log.info("Discord client is ready.");
				const liveChannel = await client.channels.fetch(voiceChannelId);

				if (liveChannel.type !== "voice") {
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
				nodecg.log.info("Joined channel");
				connection.play(appRootPath.resolve("./assets/join.mp3"), {volume: 0});
				connection.on("speaking", (user, speaking) => {
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
									"",
							},
						];
					} else {
						newStatus = currentStatus.filter(
							(speakingMember) => speakingMember.id !== member.id,
						);
					}
					speakingStatusRep.value = newStatus;
				});

				updateTimer = setInterval(() => {
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
		} catch (error: unknown) {
			nodecg.log.error(error);
		}
	};

	void initialize();
};
