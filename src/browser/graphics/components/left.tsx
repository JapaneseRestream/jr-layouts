import React from 'react';
import styled from 'styled-components';

import {Logo} from './logo';
import {UpcomingList} from './upcoming-list';
import {DiscordStatus} from './discord-status';

const Container = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 10%;
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
`;

const UpcomingTitle = styled.div`
	font-size: 25px;
	font-weight: 500;
	text-align: center;
`;

export const Left = () => (
	<Container>
		<Logo />
		<UpcomingTitle>今後のゲーム</UpcomingTitle>
		<UpcomingList />
		<DiscordStatus />
	</Container>
);
