import {
	Avatar,
	Button,
	List,
	ListItem,
	ListItemText,
	createMuiTheme,
	MuiThemeProvider,
} from '@material-ui/core';
import {
	ArrowBack,
	ArrowForward,
	Category,
	DirectionsRun,
	Mic,
	VideogameAsset,
} from '@material-ui/icons';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {Message, Replicant} from '../constants';
import {CurrentRun} from '../replicants/current-run';
import {Schedule} from '../replicants/schedule';
import {useReplicant} from '../use-nodecg/use-replicant';

const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);
const scheduleRep = nodecg.Replicant<Schedule>(Replicant.Schedule);

const theme = createMuiTheme({
	props: {
		MuiButton: {
			variant: 'contained',
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

const PreviousRunButton: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep, null);
	if (!currentRun) {
		return null;
	}
	return (
		<Button
			color='primary'
			onClick={() => {
				nodecg.sendMessage(Message.PreviousRun);
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
	const [currentRun] = useReplicant(currentRunRep, null);
	const [schedule] = useReplicant(scheduleRep, null);
	if (!currentRun || !schedule) {
		return null;
	}
	return (
		<Button
			color='primary'
			onClick={() => {
				nodecg.sendMessage(Message.NextRun);
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
	const [currentRun] = useReplicant(currentRunRep, null);
	if (!currentRun) {
		return null;
	}
	return (
		<InfoContainer>
			<List>
				<ListItem>
					<Avatar>
						<VideogameAsset />
					</Avatar>
					<ListItemText
						primary={currentRun.game}
						secondary={currentRun.english}
					/>
				</ListItem>
				<ListItem>
					<Avatar>
						<Category />
					</Avatar>
					<ListItemText primary={currentRun.category} />
				</ListItem>
				<ListItem>
					<Avatar>
						<DirectionsRun />
					</Avatar>
					<ListItemText primary={currentRun.runners} />
				</ListItem>
				<ListItem>
					<Avatar>
						<Mic />
					</Avatar>
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

ReactDOM.render(<App />, document.querySelector('#root'));
