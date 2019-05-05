import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {Button, TextField} from '@material-ui/core';
import {Message} from '../constants';

const targetChannelRep = nodecg.Replicant<string>('target-channel');

const App: React.FunctionComponent = () => {
	const [targetChannel, setTargetChannel] = useState('');
	return (
		<>
			<Button
				variant='contained'
				onClick={() => {
					nodecg.sendMessage(Message.RefreshPlayer);
				}}
			>
				レイアウトのプレイヤーを再読込する
			</Button>
			<TextField
				onChange={(e) => setTargetChannel(e.target.value)}
				placeholder='うつすTwitchチャンネル'
			/>
			<Button
				variant='contained'
				onClick={() => {
					targetChannelRep.value = targetChannel;
				}}
			>
				変える
			</Button>
		</>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
