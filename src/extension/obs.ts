import OBSWebSocket from "obs-websocket-js";

import type {NodeCG} from "./nodecg";

const obs = new OBSWebSocket();

export const setupObs = (nodecg: NodeCG) => {
	const {obs: obsConfig} = nodecg.bundleConfig;
	const logger = new nodecg.Logger("obs");
	const obsAutoRecording = nodecg.Replicant("obsAutoRecording");
	const obsStatus = nodecg.Replicant("obsStatus");
	const targetChannelRep = nodecg.Replicant("targetChannel");

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
	const takeScreenshot = async () => {
		const {name} = await obs.send("GetCurrentScene");
		const {img} = await obs.send("TakeSourceScreenshot", {
			sourceName: name,
			embedPictureFormat: "png",
			fileFormat: "png",
		});
		return img;
	};

	nodecg.listenFor("obs:take-screenshot", async (_, cb) => {
		try {
			const img = await takeScreenshot();
			if (cb && !cb.handled) {
				cb(null, img);
				return;
			}
		} catch (error: unknown) {
			if (cb && !cb.handled) {
				cb("Failed to take screenshot");
				return;
			}
			logger.error("Failed to take screenshot:", error);
		}
	});
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
	targetChannelRep.on("change", (newVal, oldVal) => {
		if (newVal === oldVal) {
			return;
		}
		const targetChannelUrl = new URL("https://player.twitch.tv");
		targetChannelUrl.searchParams.append("channel", newVal);
		targetChannelUrl.searchParams.append("muted", "false");
		targetChannelUrl.searchParams.append("parent", "twitch.tv");
		targetChannelUrl.searchParams.append("player", "popout");
		targetChannelUrl.searchParams.append("volume", "1");
		(obs.send as any)("SetSourceSettings", {
			sourceName: "TWITCH_PLAYER",
			sourceSettings: {
				url: targetChannelUrl.href,
			},
		});
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
