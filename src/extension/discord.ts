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

	const {token, screenshotChannelId} = nodecg.bundleConfig.discord;

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
