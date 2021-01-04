import OBSWebSocket from "obs-websocket-js";

import type {NodeCG} from "./nodecg";

const obs = new OBSWebSocket();

export const setupObs = async (nodecg: NodeCG) => {
	const {obs: obsConfig} = nodecg.bundleConfig;
	const logger = new nodecg.Logger("obs");
	const obsAutoRecording = nodecg.Replicant("obsAutoRecording");

	if (!obsConfig) {
		logger.warn("OBS setting is empty");
		return;
	}

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
			embedPictureFormat: "jpeg",
		});
		return img;
	};
	const swapActiveScene = async () => {
		try {
			const {name: currentScene} = await obs.send("GetCurrentScene");
			switch (currentScene) {
				case "main1":
					await obs.send("SetCurrentScene", {
						"scene-name": "main2",
					});
					break;
				case "main2":
					await obs.send("SetCurrentScene", {
						"scene-name": "main1",
					});
					break;
				default:
			}
		} catch (error: unknown) {
			logger.error("Failed to swap active scene:", error);
		}
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
				cb("Failed to take screenshot of OBS");
				return;
			}
			logger.error("Failed to take screenshot of OBS:", error);
		}
	});

	nodecg.listenFor("nextRun", () => {
		if (obsAutoRecording.value) {
			void stopRecording();
		}
		void swapActiveScene();
	});

	obs.on("Heartbeat", (data) => {
		if (obsAutoRecording.value && !data.recording) {
			void startRecording();
		}
	});

	await obs
		.connect(obsConfig)
		.then(() => {
			logger.info(`Connected to OBS on ${obsConfig.address}`);
		})
		.catch((error) => {
			logger.error("Failed to connect to OBS:", error);
		});

	await obs.send("SetHeartbeat", {enable: true});

	obsAutoRecording.on("change", (newVal) => {
		if (newVal) {
			void startRecording();
		}
	});
};
