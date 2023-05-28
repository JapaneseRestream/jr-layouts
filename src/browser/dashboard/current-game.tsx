import "./global.css";

import styled from "@emotion/styled";
import {ArrowBack, ArrowForward} from "@mui/icons-material";
import {Button, ThemeProvider, Typography} from "@mui/material";
import {createRoot} from "react-dom/client";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

import {theme} from "./lib/mui-theme";

const Container = styled.div`
	margin: 8px;
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
	padding: 8px;
	width: 100vw;
	display: grid;
	grid-auto-flow: row;
	place-items: center;
`;

const PreviousRunButton: React.FunctionComponent = () => {
	const [currentRun] = useReplicant("current-run");
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
	const [currentRun] = useReplicant("current-run");
	const [schedule] = useReplicant("schedule");
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
	const [currentRun] = useReplicant("current-run");
	if (!currentRun) {
		return null;
	}
	return (
		<InfoContainer>
			<Typography fontSize={24}>{currentRun.game}</Typography>
			<Typography fontSize={18}>
				{currentRun.category} - {currentRun.console}
			</Typography>
		</InfoContainer>
	);
};

const App: React.FunctionComponent = () => {
	return (
		<ThemeProvider theme={theme}>
			<Container>
				<Buttons />
				<Info />
			</Container>
		</ThemeProvider>
	);
};

createRoot(document.querySelector("#root")!).render(<App />);
