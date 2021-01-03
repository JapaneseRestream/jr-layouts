import OBSWebSocket from "obs-websocket-js";

import type {NodeCG} from "./nodecg";

const obs = new OBSWebSocket();

export const setupObs = async (nodecg: NodeCG) => {
	const {obs: obsConfig} = nodecg.bundleConfig;

	if (!obsConfig) {
		nodecg.log.warn("OBS setting is empty");
		return;
	}

	nodecg.listenFor("obs:take-screenshot", async (_, cb) => {
		try {
			const {name} = await obs.send("GetCurrentScene");
			const {img} = await obs.send("TakeSourceScreenshot", {
				sourceName: name,
				embedPictureFormat: "png",
			});
			if (cb && !cb.handled) {
				cb(null, img);
				return;
			}
		} catch (error: unknown) {
			if (cb && !cb.handled) {
				cb("Failed to take screenshot of OBS");
				return;
			}
			nodecg.log.error("Failed to take screenshot of OBS:", error);
		}
	});

	nodecg.listenFor("nextRun", async () => {
		await obs.send("StopRecording").catch((error) => {
			nodecg.log.warn(error.message);
		});
		await obs.send("StartRecording").catch((error) => {
			nodecg.log.error(error.message);
		});
	});

	await obs.connect(obsConfig).catch((error) => {
		if (error) {
			nodecg.log.error("Failed to connect to OBS:", error);
		}
	});
};
