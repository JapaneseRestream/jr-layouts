import React, {useState} from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import {format} from "date-fns";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

const Container = styled.div`
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

const markerTimeRep = nodecg.Replicant("lastMarkerTime");

const App: React.FunctionComponent = () => {
	const [screenshotPending, setScreenshotPending] = useState(false);
	const [screenshotState, setScreenshotState] = useState<
		"waiting" | "downloading" | "failed"
	>("waiting");

	const [markerTime] = useReplicant(markerTimeRep);
	const [pending, setPending] = useState(false);

	return (
		<Container>
			<div>
				<button
					onClick={() => {
						setPending(true);
						void nodecg.sendMessage("twitch:putMarker").then(() => {
							setPending(false);
						});
					}}
					disabled={pending}
				>
					マーカーをうつ
				</button>
				最後のマーカー:
				{markerTime ? new Date(markerTime).toLocaleString() : "N/A"}
			</div>

			<div>
				<button
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
				</button>
				{screenshotStateMessage(screenshotState)}
			</div>

			<button
				onClick={() => {
					void nodecg.sendMessage("refreshPlayer");
				}}
			>
				プレイヤー再読込
			</button>
		</Container>
	);
};

ReactDOM.render(<App />, document.querySelector("#root"));
