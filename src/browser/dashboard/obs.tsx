import {Button, Typography} from "@material-ui/core";
import React, {useState} from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import {format} from "date-fns";

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

const stateToMessage = (state: string) => {
	switch (state) {
		case "waiting":
			return "待機中";
		case "downloading":
			return "ダウンロード中";
		case "failed":
			return "失敗した";
		default:
			return "";
	}
};

const App: React.FunctionComponent = () => {
	const [pending, setPending] = useState(false);
	const [state, setState] = useState<"waiting" | "downloading" | "failed">(
		"waiting",
	);

	return (
		<Container>
			<InfoContainer>
				<Button
					style={{alignSelf: "center"}}
					variant='contained'
					onClick={() => {
						setPending(true);
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
								setState("downloading");
							})
							.catch((error) => {
								nodecg.log.error(error);
								setState("failed");
							})
							.finally(() => {
								setPending(false);
							});
					}}
					disabled={pending}
				>
					スクショをダウンロード
				</Button>
				<Typography style={{width: "100%", textAlign: "center"}}>
					{stateToMessage(state)}
				</Typography>
			</InfoContainer>
		</Container>
	);
};

ReactDOM.render(<App />, document.querySelector("#root"));
