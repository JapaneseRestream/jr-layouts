import OBSWebSocket from "obs-websocket-js";

import type {NodeCG} from "./nodecg";

export const obs = new OBSWebSocket();

export const setupObs = (nodecg: NodeCG) => {
	const {obs: obsConfig} = nodecg.bundleConfig;
	const logger = new nodecg.Logger("obs");
	const obsAutoRecording = nodecg.Replicant("obsAutoRecording");
	const obsStatus = nodecg.Replicant("obsStatus", {persistent: false});

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
	const startRecording = async () => {
		try {
			await obs.send("StartRecording");
			logger.info("Started recording");
		} catch (error: unknown) {
			logger.error("Failed to start recording:", error);
		}
	};
	const stopRecording = async () => {
		try {
			await obs.send("StopRecording");
			logger.info("Stopped recording");
		} catch (error: unknown) {
			logger.error("Failed to stop recording:", error);
		}
	};
	nodecg.listenFor("nextRun", () => {
		if (obsAutoRecording.value) {
			void stopRecording();
		}
	});
	nodecg.listenFor("obs:connect", () => {
		connect().catch((error) => {
			logger.error(error);
		});
	});

	nodecg.listenFor("refreshPlayer", () => {
		(obs.send as any)("RefreshBrowserSource", {
			sourceName: "TWITCH_PLAYER",
		});
	});

	nodecg.listenFor("setTwitchUrl", async ({channel}, cb) => {
		if (!obsStatus.value?.connected) {
			if (cb && !cb.handled) {
				cb("OBS_NOT_ACTIVE");
			}
			return;
		}

		try {
			const targetChannelUrl = new URL("https://player.twitch.tv");
			if (isNaN(parseInt(channel))) {
				targetChannelUrl.searchParams.append("channel", channel);
			} else {
				targetChannelUrl.searchParams.append("video", channel);
			}
			targetChannelUrl.searchParams.append("muted", "false");
			targetChannelUrl.searchParams.append("parent", "twitch.tv");
			targetChannelUrl.searchParams.append("player", "popout");
			targetChannelUrl.searchParams.append("volume", "1");
			await (obs.send as any)("SetSourceSettings", {
				sourceName: "TWITCH_PLAYER",
				sourceSettings: {
					url: targetChannelUrl.href,
				},
			});
			if (cb && !cb.handled) {
				cb(null);
			}
		} catch (error) {
			if (cb && !cb.handled) {
				cb("UNKNOWN");
			}
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
		if (obsAutoRecording.value && !data.recording) {
			void startRecording();
		}
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
