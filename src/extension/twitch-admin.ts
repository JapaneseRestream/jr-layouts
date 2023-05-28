import {ApiClient} from "@twurple/api";
import type {AccessToken} from "@twurple/auth";
import {
	exchangeCode,
	RefreshingAuthProvider,
	StaticAuthProvider,
} from "@twurple/auth";
import express from "express";

import type {NodeCG} from "./nodecg";

const UPDATE_INTERVAL = 10 * 1000;

export const setupTwitchAdmin = async (nodecg: NodeCG) => {
	const log = new nodecg.Logger("extension:twitch-admin");

	const twitchConfig = nodecg.bundleConfig.twitch;
	if (!twitchConfig) {
		log.error("Missing bundle's Twitch config");
		return;
	}

	const {twitchGameIdMapSheetId} = nodecg.bundleConfig;
	if (twitchGameIdMapSheetId) {
		log.warn("Using spreadsheet to obtain game ID.");
	}

	const twitchOauthRep = nodecg.Replicant("twitch-oauth");
	const currentRunRep = nodecg.Replicant("current-run");
	const lastMarkerTimeRep = nodecg.Replicant("lastMarkerTime");
	const twitchTitleRep = nodecg.Replicant("twitchTitle");
	const gameIdsRep = nodecg.Replicant("game-ids");
	const targetChannelNameRep = nodecg.Replicant("targetTwitchChannel");
	const targetChannelIdRep = nodecg.Replicant("targetTwitchChannelId");

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

	let apiClient: ApiClient | undefined;
	let ourChannelId: string | undefined;

	const setupApiClient = async (tokenData: AccessToken) => {
		const authProvider = new RefreshingAuthProvider({
			clientId: twitchConfig.clientId,
			clientSecret: twitchConfig.clientSecret,
			onRefresh: (_, tokenInfoData) => {
				twitchOauthRep.value = tokenInfoData;
			},
		});
		await authProvider.addUserForToken(tokenData);
		apiClient = new ApiClient({authProvider});
		const {userId} = await apiClient.getTokenInfo();
		if (userId) {
			ourChannelId = userId;
		}
	};

	// Read the already existing token data to initially setup API client
	if (twitchOauthRep.value) {
		await setupApiClient(twitchOauthRep.value);
	}

	const redirectApp = express();
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
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
			const {userId} = await tmpApiClient.getTokenInfo();
			if (!userId) {
				res.status(500).send("No user ID returned from Twitch");
				return;
			}
			const me = await tmpApiClient.users.getAuthenticatedUser(userId);
			if (me.name === twitchConfig.channel) {
				twitchOauthRep.value = accessToken;
				await setupApiClient(accessToken);
				res.status(200).send(`Successfully registered user ${me.name}`);
			} else {
				res.status(400).send(`Not a user to register (${me.name})`);
			}
		} catch (error: unknown) {
			res.status(500).send("Server error while getting Twitch access token");
			log.error("Server error while getting Twitch access token:", error);
		}
	});
	nodecg.mount(redirectPath, redirectApp);

	targetChannelNameRep.on("change", async (channelName) => {
		try {
			if (!apiClient || !channelName || /^\d+$/.test(channelName)) {
				return;
			}
			const target = await apiClient.users.getUserByName(channelName);
			if (target) {
				targetChannelIdRep.value = target.id;
			}
		} catch (error) {
			log.error("Error while getting target channel ID:", error);
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
			const gameIdInfo = gameIdsRep.value?.find(
				(id) => id.name === newRun.game,
			);
			await apiClient.channels.updateChannelInfo(ourChannelId, {
				title,
				gameId: gameIdInfo?.gameId ?? undefined,
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
	const updateGame = async (gameId: string, gameName: string) => {
		try {
			if (!apiClient || !ourChannelId) {
				return;
			}
			if (gameId === lastGameId) {
				return;
			}
			await apiClient.channels.updateChannelInfo(ourChannelId, {
				gameId: gameId,
			});
			gameRetryCount = 0;
			lastGameId = gameId;
			log.info(`Updated game to ${gameName} (${gameId})`);
		} catch (error) {
			if (gameRetryCount >= 5) {
				log.error("Failed to update Twitch status:", error);
				gameRetryCount = 0;
				return;
			}
			gameRetryCount += 1;
			await updateGame(gameId, gameName);
		}
	};
	const fetchMainChannelInfo = async () => {
		try {
			if (!apiClient || !ourChannelId) {
				return;
			}
			const result = await apiClient.channels.getChannelInfoById(ourChannelId);
			return result;
		} catch (error: unknown) {
			log.error("Failed to fetch game ID:", error);
			return;
		}
	};

	if (!twitchGameIdMapSheetId) {
		setInterval(async () => {
			const res = await fetchMainChannelInfo();
			if (res) {
				await updateGame(res.gameId, res.gameName);
			}
		}, UPDATE_INTERVAL);
	}

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
			lastMarkerTimeRep.value = result.creationDate.getTime();
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
	nodecg.listenFor("nextRun", putMarker);
};
