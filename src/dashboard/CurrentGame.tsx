/// <reference path="../../../../types/browser.d.ts" />

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {createMuiTheme} from '@material-ui/core/styles';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Category from '@material-ui/icons/Category';
import DirectionsRun from '@material-ui/icons/DirectionsRun';
import Mic from '@material-ui/icons/Mic';
import VideogameAsset from '@material-ui/icons/VideogameAsset';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import {Message, Replicant} from '../../types/bundle';
import {CurrentRun} from '../../types/schemas/currentRun';
import {Schedule} from '../../types/schemas/schedule';

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

interface State {
	currentRun: CurrentRun;
	scheduleLength: number;
	openEditModal: boolean;
}

class App extends React.Component<{}, State> {
	state: State = {currentRun: {}, scheduleLength: 0, openEditModal: false};

	currentRunChangeHandler = (newVal: CurrentRun) => {
		this.setState({currentRun: newVal});
	};
	scheduleChangeHandler = (newVal: Schedule) => {
		this.setState({scheduleLength: newVal.length});
	};

	componentDidMount() {
		currentRunRep.on('change', this.currentRunChangeHandler);
		scheduleRep.on('change', this.scheduleChangeHandler);
	}

	componentWillUnmount() {
		currentRunRep.removeListener('change', this.currentRunChangeHandler);
		scheduleRep.removeListener('change', this.scheduleChangeHandler);
	}

	render() {
		return (
			<MuiThemeProvider theme={theme}>
				<Container>
					<ButtonContainer>
						<Button
							color="primary"
							onClick={() => {
								nodecg
									.sendMessage(Message.PreviousRun)
									.catch(console.error);
							}}
							disabled={this.state.currentRun.index === 0}
						>
							<ArrowBack />
							前のゲーム
						</Button>
						<Button
							color="secondary"
							onClick={() => {
								this.setState({openEditModal: true});
							}}
							nodecg-dialog="edit-modal"
						>
							編集
						</Button>
						<Button
							color="primary"
							onClick={() => {
								nodecg
									.sendMessage(Message.NextRun)
									.catch(console.error);
							}}
							disabled={
								this.state.currentRun.index ===
								this.state.scheduleLength
							}
						>
							<ArrowForward />
							次のゲーム
						</Button>
					</ButtonContainer>
					<InfoContainer>
						<List>
							<ListItem>
								<Avatar>
									<VideogameAsset />
								</Avatar>
								<ListItemText
									primary={this.state.currentRun.game}
									secondary={this.state.currentRun.english}
								/>
							</ListItem>
							<ListItem>
								<Avatar>
									<Category />
								</Avatar>
								<ListItemText
									primary={this.state.currentRun.category}
								/>
							</ListItem>
							<ListItem>
								<Avatar>
									<DirectionsRun />
								</Avatar>
								<ListItemText
									primary={this.state.currentRun.runners}
								/>
							</ListItem>
							<ListItem>
								<Avatar>
									<Mic />
								</Avatar>
								<ListItemText
									primary={this.state.currentRun.commentator}
								/>
							</ListItem>
						</List>
					</InfoContainer>
				</Container>
			</MuiThemeProvider>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
