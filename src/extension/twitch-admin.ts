import {
	exchangeCode,
	RefreshingAuthProvider,
	StaticAuthProvider,
} from "@twurple/auth";
import type {HelixUser} from "@twurple/api";
import {ApiClient} from "@twurple/api";
import express from "express";

import type {NodeCG} from "./nodecg";

const UPDATE_INTERVAL = 10 * 1000;

export const setupTwitchAdmin = (nodecg: NodeCG) => {
	const log = new nodecg.Logger("extension:twitch-admin");

	const twitchConfig = nodecg.bundleConfig.twitch;

	if (!twitchConfig) {
		log.error("Missing bundle's Twitch config");
		return;
	}

	const twitchOauthRep = nodecg.Replicant("twitchOauth");
	const currentRunRep = nodecg.Replicant("currentRun");
	const lastMarkerTimeRep = nodecg.Replicant("lastMarkerTime");
	const twitchTitleRep = nodecg.Replicant("twitchTitle");

	console.log(nodecg.config.baseURL);
	const redirectPath = "/twitch-auth-callback";
	const redirectUrl = new URL(
		redirectPath,
		nodecg.config.baseURL.includes("localhost")
			? `http://${nodecg.config.baseURL}`
			: `https://${nodecg.config.baseURL}`,
	);
	const authPageUrl = new URL("https://id.twitch.tv/oauth2/authorize");
	authPageUrl.searchParams.append("client_id", twitchConfig.clientId);
	authPageUrl.searchParams.append("redirect_uri", redirectUrl.href);
	authPageUrl.searchParams.append("response_type", "code");
	authPageUrl.searchParams.append(
		"scope",
		"channel:manage:broadcast user:edit:broadcast",
	);
	log.warn("TWITCH AUTHENTICATION URL:", authPageUrl.href);
	const redirectApp = express();
	redirectApp.get("/", async (req, res) => {
		try {
			const {code} = req.query;
			if (typeof code !== "string") {
				res.status(400).send("Invalid authorization code");
				return;
			}
			const accessToken = await exchangeCode(
				twitchConfig.clientId,
				twitchConfig.clientSecret,
				code,
				redirectUrl.href,
			);
			const tmpApiClient = new ApiClient({
				authProvider: new StaticAuthProvider(
					twitchConfig.clientId,
					accessToken,
				),
			});
			const me = await tmpApiClient.users.getMe();
			if (me.name === twitchConfig.ourChannel) {
				twitchOauthRep.value = accessToken;
				res.status(200).send(`Successfully registered user ${me.name}`);
				return;
			}
		} catch (error: unknown) {
			res.status(500).send("Server error while getting Twitch access token");
			log.error("Server error while getting Twitch access token:", error);
		}
	});
	nodecg.mount(redirectPath, redirectApp);

	let apiClient: ApiClient | undefined;

	let ourChannelId: HelixUser | undefined;
	let originalChannelId: HelixUser | undefined;

	twitchOauthRep.on("change", async (twitchOauth) => {
		try {
			if (!twitchOauth) {
				return;
			}
			const authProvider = new RefreshingAuthProvider(
				{
					clientId: twitchConfig.clientId,
					clientSecret: twitchConfig.clientSecret,
					onRefresh: (tokenInfoData) => {
						twitchOauthRep.value = tokenInfoData;
					},
				},
				twitchOauth,
			);

			apiClient = new ApiClient({authProvider});

			const result = await Promise.all([
				apiClient.users.getUserByName(twitchConfig.ourChannel),
				apiClient.users.getUserByName(twitchConfig.originalChannel),
			]);
			if (result[0] && result[1]) {
				ourChannelId = result[0];
				originalChannelId = result[1];
			}
		} catch (error: unknown) {
			log.error("Failed to set up API client:", error);
		}
	});

	let lastUpdatedTitle = "";
	let titleRetryCount = 0;
	const updateTitle = async () => {
		try {
			const newRun = currentRunRep.value;
			if (
				!apiClient ||
				!ourChannelId ||
				!twitchTitleRep.value ||
				!newRun ||
				!newRun.game ||
				lastUpdatedTitle === newRun.game
			) {
				return;
			}
			const title = `[JP] ${twitchTitleRep.value} - ${newRun.game}`;
			await apiClient.channels.updateChannelInfo(ourChannelId, {
				title,
			});
			titleRetryCount = 0;
			lastUpdatedTitle = title;
			log.info(`Updated title to "${title}"`);
		} catch (error: unknown) {
			if (titleRetryCount >= 5) {
				log.error("Failed to update title:", error);
				titleRetryCount = 0;
				return;
			}
			titleRetryCount += 1;
			await updateTitle();
		}
	};
	currentRunRep.on("change", updateTitle);
	twitchTitleRep.on("change", updateTitle);

	let lastGameId = "";
	let gameRetryCount = 0;
	const updateGame = async () => {
		try {
			if (!apiClient || !ourChannelId || !originalChannelId) {
				return;
			}
			const result = await apiClient.channels.getChannelInfo(originalChannelId);
			if (!result || result.gameId === lastGameId) {
				return;
			}
			await apiClient.channels.updateChannelInfo(ourChannelId, {
				gameId: result.gameId,
			});
			gameRetryCount = 0;
			lastGameId = result.gameId;
			log.info(`Updated game to ${result.gameName} (${result.gameId})`);
		} catch (error: unknown) {
			if (gameRetryCount >= 5) {
				log.error("Failed to update Twitch status:", error);
				gameRetryCount = 0;
				return;
			}
			gameRetryCount += 1;
			await updateGame();
		}
	};

	setInterval(updateGame, UPDATE_INTERVAL);

	let markerRetryCount = 0;
	const putMarker = async (): Promise<boolean> => {
		try {
			if (!apiClient || !ourChannelId) {
				return false;
			}
			const result = await apiClient.streams.createStreamMarker(
				ourChannelId,
				currentRunRep.value?.game,
			);
			markerRetryCount = 0;
			lastMarkerTimeRep.value = result.creationDate.getDate();
			log.info(`Put marker at ${result.creationDate.toISOString()}`);
			return true;
		} catch (error: unknown) {
			log.error("Failed to put marker on Twitch stream:", error);
			if (markerRetryCount >= 1) {
				log.error("not retrying");
				markerRetryCount = 0;
				return false;
			}
			log.error("retrying");
			markerRetryCount += 1;
			return putMarker();
		}
	};
	nodecg.listenFor("twitch:putMarker", async (_, cb) => {
		try {
			const success = await putMarker();
			if (cb && !cb.handled) {
				cb(null, success);
				return;
			}
		} catch (error: unknown) {
			if (cb && !cb.handled) {
				cb(null, false);
			}
		}
	});
};
