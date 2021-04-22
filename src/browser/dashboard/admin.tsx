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
	if (obsAutoRecording === null) {
		return null;
	}
	return (
		<Container>
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
		</Container>
	);
};

ReactDOM.render(<App></App>, document.querySelector("#root"));
