import {Button, Typography} from '@material-ui/core';
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

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

const App: React.FunctionComponent = () => {
	const [pending, setPending] = useState(false);
	const [state, setState] = useState<'waiting' | 'downloading' | 'failed'>(
		'waiting',
	);

	return (
		<Container>
			<InfoContainer>
				<Button
					style={{alignSelf: 'center'}}
					variant='contained'
					onClick={() => {
						setPending(true);
						nodecg
							.sendMessage('obs:take-screenshot')
							.then((img) => {
								const a = document.createElement('a');
								a.href = img;
								const now = new Date();
								a.setAttribute(
									'download',
									`obs-${now.getFullYear()}-${
										now.getMonth() + 1
									}-${now.getDate()}`,
								);
								a.click();
								setState('downloading');
							})
							.catch((error) => {
								nodecg.log.error(error);
								setState('failed');
							})
							.finally(() => {
								setPending(false);
							});
					}}
					disabled={pending}
				>
					スクショをダウンロード
				</Button>
				<Typography style={{width: '100%', textAlign: 'center'}}>
					{state === 'waiting'
						? '待機中'
						: state === 'downloading'
						? 'ダウンロード中'
						: state === 'failed'
						? '失敗した'
						: ''}
				</Typography>
			</InfoContainer>
		</Container>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
