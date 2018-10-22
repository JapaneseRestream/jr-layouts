import * as React from 'react';
import styled from 'styled-components';
import {Clock} from './Clock';
import {Logo} from './Logo';
import {UpcomingList} from './UpcomingList';

const LeftContainer = styled.div`
	grid-column: 1 / 2;
	grid-row: 1 / 3;
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
`;

const UpcomingTitle = styled.div`
	font-size: 30px;
	font-weight: 500;
	text-align: center;
	margin-top: 10px;
`;

export const Left = () => (
	<LeftContainer>
		<Logo />
		<UpcomingTitle>今後のゲーム</UpcomingTitle>
		<UpcomingList />
		<Clock />
	</LeftContainer>
);
