import "modern-normalize";

import styled from "styled-components";
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

const Container = styled.div`
	margin: 8px;

	display: grid;
	grid-gap: 8px;
	grid-auto-flow: row;
`;

const App: React.FunctionComponent = () => {
	const [obsAutoRecording, setObsAutoRecording] = useReplicant(
		nodecg.Replicant("obsAutoRecording"),
	);

	const [hashtag, setHashtag] = useReplicant(nodecg.Replicant("hashtag"));
	const [tmpHashtag, setTmpHashtag] = useState("");
	useEffect(() => {
		if (hashtag !== null) {
			setTmpHashtag(hashtag);
		}
	}, [hashtag]);

	const [targetChannel, setTargetChannel] = useReplicant(
		nodecg.Replicant("targetChannel"),
	);
	const [tmpTargetChannel, setTmpTargetChannel] = useState("");
	useEffect(() => {
		if (targetChannel !== null) {
			setTmpTargetChannel(targetChannel);
		}
	}, [targetChannel]);

	const [twitchTitle, setTwitchTitle] = useReplicant(
		nodecg.Replicant("twitchTitle"),
	);
	const [tmpTwitchTitle, setTmpTwitchTitle] = useState("");
	useEffect(() => {
		if (twitchTitle !== null) {
			setTmpTwitchTitle(twitchTitle);
		}
	}, [twitchTitle]);

	const [obsStatus] = useReplicant(nodecg.Replicant("obsStatus"));

	if (obsAutoRecording === null) {
		return null;
	}

	return (
		<Container>
			<div>
				<label>ハッシュタグ</label>
				<input
					type='text'
					value={tmpHashtag ?? ""}
					onChange={(e) => {
						setTmpHashtag(e.target.value);
					}}
				></input>
				<button
					onClick={() => {
						setHashtag(tmpHashtag);
					}}
				>
					更新
				</button>
			</div>
			{obsStatus?.connected ? (
				<div>
					<div>
						OBS配信:{" "}
						{obsStatus?.stream
							? `稼働中 (${Math.floor(obsStatus.streamTime / 60 / 60)}時間)`
							: "停止中"}
					</div>
					<div>
						OBS録画:{" "}
						{obsStatus?.record
							? `稼働中 (${Math.floor(obsStatus.recordTime / 60)}分)`
							: "停止中"}
					</div>
				</div>
			) : (
				<div>OBS切断中</div>
			)}
			<div>
				<label>OBS自動録画オン</label>
				<input
					type='checkbox'
					checked={obsAutoRecording}
					onChange={(e) => {
						setObsAutoRecording(e.target.checked);
					}}
				></input>
			</div>
			<div>
				<label>Twitch</label>
				<input
					type='text'
					value={tmpTargetChannel ?? ""}
					onChange={(e) => {
						setTmpTargetChannel(e.target.value);
					}}
				></input>
				<button
					onClick={() => {
						setTargetChannel(tmpTargetChannel);
					}}
				>
					更新
				</button>
			</div>
			<div>
				<label>タイトル</label>
				<input
					type='text'
					value={tmpTwitchTitle ?? ""}
					onChange={(e) => {
						setTmpTwitchTitle(e.target.value);
					}}
				></input>
				<button
					onClick={() => {
						setTwitchTitle(tmpTwitchTitle);
					}}
				>
					更新
				</button>
			</div>
		</Container>
	);
};

ReactDOM.render(<App></App>, document.querySelector("#root"));
