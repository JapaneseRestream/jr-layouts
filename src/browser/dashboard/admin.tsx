import "./global.css";

import styled from "@emotion/styled";
import {Box, Button, TextField, ThemeProvider, Typography} from "@mui/material";
import {type FC, useEffect, useState} from "react";
import {createRoot} from "react-dom/client";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

import {theme} from "./lib/mui-theme";

const Container = styled(Box)`
	margin: 16px;

	display: grid;
	gap: 16px;
	grid-auto-flow: row;
`;

const Row = styled(Box)`
	display: grid;
	grid-auto-flow: column;
	place-content: center;
	place-items: center;
	gap: 8px;
`;

const App: FC = () => {
	const [hashtag, setHashtag] = useReplicant("hashtag");
	const [tmpHashtag, setTmpHashtag] = useState("");
	useEffect(() => {
		if (hashtag) {
			setTmpHashtag(hashtag);
		}
	}, [hashtag]);

	const [targetChannel, setTargetChannel] = useReplicant("targetTwitchChannel");
	const [tmpTargetChannel, setTmpTargetChannel] = useState("");
	useEffect(() => {
		if (targetChannel) {
			setTmpTargetChannel(targetChannel);
		}
	}, [targetChannel]);

	const [twitchTitle, setTwitchTitle] = useReplicant("twitchTitle");
	const [tmpTwitchTitle, setTmpTwitchTitle] = useState("");
	useEffect(() => {
		if (twitchTitle) {
			setTmpTwitchTitle(twitchTitle);
		}
	}, [twitchTitle]);

	const [obsStatus] = useReplicant("obs-status");

	return (
		<ThemeProvider theme={theme}>
			<Container>
				<Row>
					<TextField
						label='ハッシュタグ'
						value={tmpHashtag}
						onChange={(e) => {
							setTmpHashtag(e.target.value);
						}}
					/>
					<Button
						onClick={() => {
							setHashtag(tmpHashtag);
						}}
					>
						更新
					</Button>
				</Row>
				<Row>
					{obsStatus?.connected ? (
						<Typography>
							<span>OBS配信: </span>
							<span>
								{obsStatus.stream
									? `稼働中 (${Math.floor(obsStatus.streamTime / 60 / 60)}時間)`
									: "停止中"}
							</span>
						</Typography>
					) : (
						<Typography>OBS切断中</Typography>
					)}
				</Row>
				<Row>
					<TextField
						label='Twitch'
						value={tmpTargetChannel}
						onChange={(e) => {
							setTmpTargetChannel(e.target.value);
						}}
					/>
					<Button
						onClick={() => {
							setTargetChannel(tmpTargetChannel);
						}}
					>
						更新
					</Button>
				</Row>
				<Row>
					<TextField
						label='配信タイトル'
						value={tmpTwitchTitle}
						onChange={(e) => {
							setTmpTwitchTitle(e.target.value);
						}}
					/>
					<Button
						onClick={() => {
							setTwitchTitle(tmpTwitchTitle);
						}}
					>
						更新
					</Button>
				</Row>
				<Row>
					<Button
						color='warning'
						onClick={() => {
							if (confirm("起動するとお金がかかります。本当に起動しますか？")) {
								void nodecg.sendMessage("startStreamPc");
							}
						}}
					>
						配信PCを起動
					</Button>
				</Row>
			</Container>
		</ThemeProvider>
	);
};

createRoot(document.querySelector("#root")!).render(<App />);
