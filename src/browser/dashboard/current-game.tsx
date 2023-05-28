import "./global.css";

import styled from "@emotion/styled";
import {
	ArrowBack,
	ArrowForward,
	Category,
	Mic,
	VideogameAsset,
} from "@mui/icons-material";
import {
	Avatar,
	Button,
	List,
	ListItem,
	ListItemText,
	ThemeProvider,
} from "@mui/material";
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
					<ListItemText primary={currentRun.console} />
				</ListItem>
			</List>
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
