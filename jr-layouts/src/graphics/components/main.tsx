import * as React from 'react';
import styled, {createGlobalStyle} from 'styled-components';
import {Left} from './left';
import {RunInfo} from './run-info';

const GlobalStyle = createGlobalStyle`
	body {
		color: #d1edfd;
		background-color: #051113;
		margin: 0 0;
		font-family: 'Rounded Mplus 1c';
		line-height: 1.25;
	}
`;

const Container = styled.div`
	position: absolute;
	width: 1920px;
	height: 1080px;
	overflow: hidden;
	display: grid;
	grid-template-columns: 230px 1fr;
	grid-template-rows: 1fr 130px;
`;

const BottomContainer = styled.div`
	grid-column: 2 / 3;
	grid-row: 2 / 3;
	margin-left: 10px;
`;

export const Main: React.StatelessComponent = () => (
	<Container>
		<Left />
		<BottomContainer>
			<RunInfo />
		</BottomContainer>
		<GlobalStyle />
	</Container>
);
