import "modern-normalize";

import styled from "styled-components";
import React from "react";
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
		</Container>
	);
};

ReactDOM.render(<App></App>, document.querySelector("#root"));
