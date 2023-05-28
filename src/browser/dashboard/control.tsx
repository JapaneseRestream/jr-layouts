import "./global.css";

import styled from "@emotion/styled";
import {Box, Button, ThemeProvider, Typography} from "@mui/material";
import format from "date-fns/format";
import {type FC, useState} from "react";
import {createRoot} from "react-dom/client";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

import {theme} from "./lib/mui-theme";

const Container = styled(Box)`
	margin: 8px;
	display: grid;
	grid-gap: 8px;

	align-content: center;
	justify-content: center;
	align-items: center;
	justify-items: center;
`;

const screenshotStateMessage = (state: string) => {
	switch (state) {
		case "waiting":
			return "";
		case "downloading":
			return "ダウンロード中";
		case "failed":
			return "失敗した";
		default:
			return "";
	}
};

const App: FC = () => {
	const [screenshotPending, setScreenshotPending] = useState(false);
	const [screenshotState, setScreenshotState] = useState<
		"waiting" | "downloading" | "failed"
	>("waiting");

	const [markerTime] = useReplicant("lastMarkerTime");
	const [pending, setPending] = useState(false);

	return (
		<ThemeProvider theme={theme}>
			<Container>
				<Box>
					<Button
						onClick={() => {
							setPending(true);
							void nodecg.sendMessage("twitch:putMarker").then(() => {
								setPending(false);
							});
						}}
						disabled={pending}
					>
						マーカーをうつ
					</Button>
					<Typography>
						最後のマーカー:
						{markerTime ? new Date(markerTime).toLocaleString() : "N/A"}
					</Typography>
				</Box>

				{nodecg.bundleConfig.obs && (
					<div>
						<Button
							onClick={() => {
								setScreenshotPending(true);
								nodecg
									.sendMessage("obs:take-screenshot")
									.then((img) => {
										const a = document.createElement("a");
										a.href = img;
										a.setAttribute(
											"download",
											`obs-screenshot-${format(new Date(), "yyyyMMdd-HHmmss")}`,
										);
										a.click();
										setScreenshotState("downloading");
									})
									.catch((error) => {
										nodecg.log.error(error);
										setScreenshotState("failed");
									})
									.finally(() => {
										setScreenshotPending(false);
									});
							}}
							disabled={screenshotPending}
						>
							スクショをダウンロード
						</Button>
						{screenshotStateMessage(screenshotState)}
					</div>
				)}

				{nodecg.bundleConfig.obs && (
					<Button
						onClick={() => {
							void nodecg.sendMessage("refreshPlayer");
						}}
					>
						プレイヤー再読込
					</Button>
				)}

				<div>
					<Button
						onClick={() => {
							void nodecg.sendMessage("refreshDiscordBot");
						}}
					>
						Discord VCの表示をなおす
					</Button>
				</div>
			</Container>
		</ThemeProvider>
	);
};

createRoot(document.querySelector("#root")!).render(<App />);
