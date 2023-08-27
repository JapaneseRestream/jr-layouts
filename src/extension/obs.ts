import OBSWebSocket from "obs-websocket-js";

import type {NodeCG} from "./nodecg";

export const obs = new OBSWebSocket();

export const setupObs = (nodecg: NodeCG) => {
	const {obs: obsConfig} = nodecg.bundleConfig;
	const logger = new nodecg.Logger("obs");
	const obsStatus = nodecg.Replicant("obs-status", {persistent: false});
	const targetChannelRep = nodecg.Replicant("targetTwitchChannel");

	if (!obsConfig) {
		logger.warn("OBS setting is empty");
		return;
	}

	let attemptingToConnect = false;
	const connect = async (emitError = true) => {
		if (attemptingToConnect) {
			return;
		}
		attemptingToConnect = true;
		try {
			await obs.connect(obsConfig);
			await obs.send("SetHeartbeat", {enable: true});
		} catch (error: unknown) {
			if (emitError) {
				logger.error("Failed to connect:", error);
			}
		} finally {
			attemptingToConnect = false;
		}
	};
	nodecg.listenFor("obs:connect", () => {
		connect().catch((error) => {
			logger.error(error);
		});
	});

	nodecg.listenFor("refreshPlayer", () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-explicit-any
		(obs.send as any)("RefreshBrowserSource", {
			sourceName: "TWITCH_PLAYER",
		});
	});

	targetChannelRep.on("change", async (channel) => {
		try {
			if (!obsStatus.value?.connected) {
				return;
			}
			const targetChannelUrl = new URL("https://player.twitch.tv");
			if (/^\d+$/.test(channel)) {
				targetChannelUrl.searchParams.append("video", channel);
			} else {
				targetChannelUrl.searchParams.append("channel", channel);
			}
			targetChannelUrl.searchParams.append("muted", "false");
			targetChannelUrl.searchParams.append("parent", "twitch.tv");
			targetChannelUrl.searchParams.append("player", "popout");
			targetChannelUrl.searchParams.append("volume", "1");
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-explicit-any
			await (obs.send as any)("SetSourceSettings", {
				sourceName: "TWITCH_PLAYER",
				sourceSettings: {
					url: targetChannelUrl.href,
				},
			});
		} catch (error) {
			nodecg.log.error("Failed to update OBS browser source URL:", error);
		}
	});

	obs.on("ConnectionOpened", () => {
		logger.info(`Connected: ${obsConfig.address}`);
		obsStatus.value = {
			connected: true,
			record: false,
			stream: false,
			streamTime: 0,
			recordTime: 0,
		};
	});
	obs.on("Heartbeat", (data) => {
		obsStatus.value = {
			connected: true,
			record: data.recording ?? false,
			stream: data.streaming ?? false,
			streamTime: data["total-stream-time"] ?? 0,
			recordTime: data["total-record-time"] ?? 0,
		};
	});
	obs.on("ConnectionClosed", () => {
		if (obsStatus.value?.connected) {
			logger.info(`Disconnected`);
			obsStatus.value = {
				connected: false,
				record: false,
				stream: false,
				streamTime: 0,
				recordTime: 0,
			};
		}
	});

	void connect();

	setInterval(() => {
		if (!obsStatus.value?.connected) {
			void connect(false);
		}
	}, 1000);
};
