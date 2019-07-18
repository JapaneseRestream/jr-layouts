import {createMuiTheme, MuiThemeProvider, TextField} from '@material-ui/core';
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import {useReplicant} from '../shared/use-nodecg/use-replicant';

const currentRunRep = nodecg.Replicant('currentRun');

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

const App: React.FunctionComponent = () => {
	const [currentRun, setCurrentRun] = useReplicant(currentRunRep);
	const [game, updateGame] = useState('');
	const [category, updateCategory] = useState('');
	const [commentator, updateCommentator] = useState('');
	useEffect(() => {
		const onOpen = () => {
			if (!currentRun) {
				return;
			}
			updateGame(currentRun.game);
			updateCategory(currentRun.category);
			updateCommentator(currentRun.commentator);
		};
		const onConfirm = () => {
			if (!currentRun) {
				return;
			}
			setCurrentRun({...currentRun, game, category, commentator});
		};
		document.addEventListener('dialog-opened', onOpen);
		document.addEventListener('dialog-confirmed', onConfirm);
		return () => {
			document.removeEventListener('dialog-opened', onOpen);
			document.removeEventListener('dialog-confirmed', onConfirm);
		};
	});
	if (!currentRun) {
		return null;
	}
	return (
		<Container>
			<MuiThemeProvider theme={theme}>
				<TextField
					label='ゲーム'
					value={game}
					helperText={currentRun.english}
					onChange={(changeEvent) => {
						updateGame(changeEvent.target.value);
					}}
				/>
				<TextField
					label='カテゴリー'
					value={category}
					onChange={(changeEvent) => {
						updateCategory(changeEvent.target.value);
					}}
				/>
				<TextField
					label='解説'
					value={commentator}
					onChange={(changeEvent) => {
						updateCommentator(changeEvent.target.value);
					}}
				/>
			</MuiThemeProvider>
		</Container>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
