import {
	Avatar,
	Button,
	List,
	ListItem,
	ListItemText,
	createMuiTheme,
	MuiThemeProvider,
} from "@material-ui/core";
import {
	ArrowBack,
	ArrowForward,
	Category,
	Mic,
	VideogameAsset,
} from "@material-ui/icons";
import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

const currentRunRep = nodecg.Replicant("currentRun");
const scheduleRep = nodecg.Replicant("schedule");

const theme = createMuiTheme({
	props: {
		MuiButton: {
			variant: "contained",
		},
	},
});

const Container = styled.div`
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: center;
`;

const ButtonContainer = styled.div`
	display: grid;
	grid-auto-flow: column;
	justify-content: center;
	gap: 8px;
`;

const InfoContainer = styled.div`
	width: 100vw;
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: flex-start;
`;

const StyledAvatar = styled(Avatar)`
	margin: 0 4px;
`;

const PreviousRunButton: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep);
	if (!currentRun) {
		return null;
	}
	return (
		<Button
			color='primary'
			onClick={() => {
				void nodecg.sendMessage("previousRun");
			}}
			disabled={currentRun.index === 0}
		>
			<ArrowBack />
			前のゲーム
		</Button>
	);
};
const EditButton: React.FunctionComponent = () => {
	return (
		<Button color='secondary' nodecg-dialog='edit-modal'>
			編集
		</Button>
	);
};
const NextRunButton: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep);
	const [schedule] = useReplicant(scheduleRep);
	if (!currentRun || !schedule) {
		return null;
	}
	return (
		<Button
			color='primary'
			onClick={() => {
				void nodecg.sendMessage("nextRun");
			}}
			disabled={currentRun.index === schedule.length}
		>
			<ArrowForward />
			次のゲーム
		</Button>
	);
};
const Buttons: React.FunctionComponent = () => {
	return (
		<ButtonContainer>
			<PreviousRunButton />
			<EditButton />
			<NextRunButton />
		</ButtonContainer>
	);
};

const Info: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep);
	if (!currentRun) {
		return null;
	}
	return (
		<InfoContainer>
			<List>
				<ListItem>
					<StyledAvatar>
						<VideogameAsset />
					</StyledAvatar>
					<ListItemText primary={currentRun.game} />
				</ListItem>
				<ListItem>
					<StyledAvatar>
						<Category />
					</StyledAvatar>
					<ListItemText primary={currentRun.category} />
				</ListItem>
				<ListItem>
					<StyledAvatar>
						<Mic />
					</StyledAvatar>
					<ListItemText primary={currentRun.commentator} />
				</ListItem>
			</List>
		</InfoContainer>
	);
};

const App: React.FunctionComponent = () => {
	return (
		<MuiThemeProvider theme={theme}>
			<Container>
				<Buttons />
				<Info />
			</Container>
		</MuiThemeProvider>
	);
};

ReactDOM.render(<App />, document.querySelector("#root"));
