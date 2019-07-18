import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {Button, TextField} from '@material-ui/core';

import {useReplicant} from '../shared/use-nodecg/use-replicant';

const targetChannelRep = nodecg.Replicant('targetChannel');

const App: React.FunctionComponent = () => {
	const [targetChannel, setTargetChannel] = useState<string | null>(null);
	const [targetChannelRepValue, setTargetChannelRep] = useReplicant(
		targetChannelRep,
	);
	const latestChannel = targetChannel || targetChannelRepValue || '';

	return (
		<>
			<Button
				variant='contained'
				onClick={() => {
					nodecg.sendMessage('refreshPlayer');
				}}
			>
				レイアウトのプレイヤーを再読込する
			</Button>
			<TextField
				value={latestChannel}
				onChange={(e) => setTargetChannel(e.target.value)}
				placeholder='うつすTwitchチャンネル'
			/>
			<Button
				variant='contained'
				onClick={() => {
					setTargetChannelRep(latestChannel);
				}}
			>
				変える
			</Button>
		</>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
