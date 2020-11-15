import {Button, Typography} from "@material-ui/core";
import React, {useState} from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

const Container = styled.div`
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: center;
`;

const InfoContainer = styled.div`
	width: 100vw;
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: flex-start;
`;

const markerTimeRep = nodecg.Replicant("lastMarkerTime");
const App: React.FunctionComponent = () => {
	const [markerTime] = useReplicant(markerTimeRep);
	const [pending, setPending] = useState(false);
	if (!nodecg.bundleConfig.twitch) {
		return null;
	}
	return (
		<Container>
			<InfoContainer>
				<Button
					style={{alignSelf: "center"}}
					variant='contained'
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
				<Typography
					style={{width: "100%", textAlign: "center"}}
				>{`最後のマーカー: ${
					markerTime ? new Date(markerTime).toLocaleString() : "N/A"
				}`}</Typography>
			</InfoContainer>
		</Container>
	);
};

ReactDOM.render(<App />, document.querySelector("#root"));
