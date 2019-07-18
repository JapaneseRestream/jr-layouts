import React from 'react';
import styled from 'styled-components';

import {Left} from './left';
import {RunInfo} from './run-info';
import {TwitchPlayer} from './twitch-player';
import {Clock} from './clock';

const Container = styled.div`
	position: absolute;
	width: 1920px;
	height: 1080px;
	overflow: hidden;
`;

export const Main: React.FunctionComponent = () => {
	return (
		<Container>
			<Left />
			<RunInfo />
			<TwitchPlayer />
			<Clock />
		</Container>
	);
};
