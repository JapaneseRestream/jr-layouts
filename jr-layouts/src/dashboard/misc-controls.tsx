import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from '@material-ui/core';
import {Message} from '../constants';

const App: React.FunctionComponent = () => {
	return (
		<Button
			variant='contained'
			onClick={() => {
				nodecg.sendMessage(Message.RefreshPlayer);
			}}
		>
			レイアウトのプレイヤーを再読込する
		</Button>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
