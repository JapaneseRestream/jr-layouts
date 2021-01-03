import "modern-normalize";

import React from "react";
import ReactDOM from "react-dom";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

const App: React.FunctionComponent = () => {
	const [obsAutoRecording, setObsAutoRecording] = useReplicant(
		nodecg.Replicant("obsAutoRecording"),
	);
	if (obsAutoRecording === null) {
		return null;
	}
	return (
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
	);
};

ReactDOM.render(<App></App>, document.querySelector("#root"));
