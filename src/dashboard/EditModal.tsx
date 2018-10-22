/// <reference path="../../../../types/browser.d.ts" />

import {createMuiTheme} from '@material-ui/core/styles';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import {Replicant} from '../../types/bundle';
import {CurrentRun} from '../../types/schemas/currentRun';

const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);
const waitForCurrentRunRep = NodeCG.waitForReplicants(currentRunRep);

const Container = styled.div`
	margin: 8px;
	display: grid;
	grid-auto-flow: row;
	gap: 16px;
`;

const theme = createMuiTheme({
	palette: {
		type: 'dark',
	},
});

interface State {
	game: string;
	category: string;
	commentator: string;
	english: string;
}

class App extends React.Component<{}, State> {
	state: State = {game: '', category: '', commentator: '', english: ''};

	async componentDidMount() {
		document.addEventListener('dialog-opened', this.readCurrentRun);
		document.addEventListener('dialog-confirmed', this.updateCurrentRun);
	}
	componentWillUnmount() {
		document.removeEventListener('dialog-opened', this.readCurrentRun);
		document.removeEventListener('dialog-confirmed', this.updateCurrentRun);
	}

	private readonly readCurrentRun = async () => {
		await waitForCurrentRunRep;
		const currentRun = currentRunRep.value;
		if (!currentRun) {
			return;
		}
		this.setState({
			game: currentRun.game || '',
			category: currentRun.category || '',
			commentator: currentRun.commentator || '',
			english: currentRun.english || '',
		});
	};

	private readonly updateCurrentRun = () => {
		currentRunRep.value = {...currentRunRep.value, ...this.state};
	};

	render() {
		return (
			<Container>
				<MuiThemeProvider theme={theme}>
					<TextField
						label="ゲーム"
						value={this.state.game}
						helperText={this.state.english}
						onChange={changeEvent => {
							this.setState({game: changeEvent.target.value});
						}}
					/>
					<TextField
						label="カテゴリー"
						value={this.state.category}
						onChange={changeEvent => {
							this.setState({category: changeEvent.target.value});
						}}
					/>
					<TextField
						label="解説"
						value={this.state.commentator}
						onChange={changeEvent => {
							this.setState({
								commentator: changeEvent.target.value,
							});
						}}
					/>
				</MuiThemeProvider>
			</Container>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
