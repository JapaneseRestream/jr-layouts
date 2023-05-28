import {joinVoiceChannel, VoiceReceiver} from "@discordjs/voice";
import discord, {
	ChannelType,
	GatewayIntentBits,
	IntentsBitField,
} from "discord.js";

import type {NodeCG} from "./nodecg";
import {obs} from "./obs";

const takeScreenshot = async () => {
	const {name} = await obs.send("GetCurrentScene");
	const {img} = await obs.send("TakeSourceScreenshot", {
		sourceName: name,
		embedPictureFormat: "png",
		fileFormat: "png",
	});
	return img;
};

export const setupDiscord = async (nodecg: NodeCG) => {
	const {default: filenamify} = await import("filenamify");

	if (!nodecg.bundleConfig.discord) {
		nodecg.log.warn("Discord settings are empty");
		return;
	}

	const {token, voiceChannelId, screenshotChannelId} =
		nodecg.bundleConfig.discord;

	const discordLiveChannelRep = nodecg.Replicant("discord-live-channel", {
		persistent: false,
	});

	let client: discord.Client | null = null;
	let screenshotChannel:
		| discord.TextChannel
		| discord.DMChannel
		| discord.NewsChannel
		| null = null;

	nodecg.listenFor("obs:take-screenshot", async (_, cb) => {
		try {
			const img = await takeScreenshot();
			if (screenshotChannel) {
				const name = nodecg.Replicant("current-run").value?.game ?? "";
				const safeName = filenamify(name, {replacement: "_"});
				await screenshotChannel.send({
					files: [
						{
							attachment: Buffer.from(
								img.replace("data:image/png;base64,", ""),
								"base64",
							),
							name: `screenshot-${safeName}-${Date.now()}.png`,
						},
					],
				});
			}
			if (cb && !cb.handled) {
				cb(null, img);
			}
		} catch (error: unknown) {
			nodecg.log.error("Failed to take screenshot:", error);
			if (cb && !cb.handled) {
				cb("Failed to take screenshot");
			}
		}
	});

	const initialize = async () => {
		try {
			if (client) {
				client.destroy();
			}

			client = new discord.Client({
				intents: [
					IntentsBitField.Flags.Guilds,
					GatewayIntentBits.GuildVoiceStates,
				],
			});

			await client.login(token);

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
				if (!client) {
					return;
				}
				try {
					nodecg.log.info("Discord client is ready.");

					// Find and set the text channel to send screenshots
					if (screenshotChannelId) {
						const channel = await client.channels.fetch(screenshotChannelId);
						if (channel?.type === ChannelType.GuildText) {
							screenshotChannel = channel;
						} else {
							nodecg.log.error(
								`Discord channel ${screenshotChannelId} is not text channel`,
							);
						}
					}

					const liveChannel = await client.channels.fetch(voiceChannelId);

					if (!liveChannel) {
						nodecg.log.error(`Discord channel ${voiceChannelId} not found`);
						return;
					}
					if (!liveChannel.isVoiceBased()) {
						nodecg.log.error(
							`Discord channel ${liveChannel.id} is not voice channel`,
						);
						return;
					}

					if (!liveChannel.joinable) {
						nodecg.log.error(
							`Cannot join voice channel ${liveChannel.name} (${liveChannel.id})`,
						);
						return;
					}

					nodecg.log.info(`Joining channel ${liveChannel.name}`);
					const connection = joinVoiceChannel({
						channelId: liveChannel.id,
						guildId: liveChannel.guild.id,
						adapterCreator: liveChannel.guild.voiceAdapterCreator,
						selfDeaf: false,
					});

					connection.on("stateChange", () => {
						discordLiveChannelRep.value = liveChannel.members.map((member) => ({
							id: member.id,
							nickname: member.nickname ?? undefined,
							username: member.user.username,
							discriminator: member.user.discriminator,
							avatar: member.user.avatarURL() ?? undefined,
						}));
					});

					const voiceReceiver = new VoiceReceiver(connection);

					const stream = voiceReceiver.subscribe("");
					stream.on("readable", () => {
						console.log("hello");
					});
					stream.on("data", (chunk) => {
						console.log("voice", chunk);
					});
				} catch (error) {
					nodecg.log.error(error);
				}
			});
		} catch (error: unknown) {
			nodecg.log.error(error);
		}
	};

	void initialize();

	nodecg.listenFor("refreshDiscordBot", () => {
		void initialize();
	});
};
