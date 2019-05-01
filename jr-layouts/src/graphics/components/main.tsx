import '../styles/global.css';
import React from 'react';
import styled from 'styled-components';
import {Left} from './left';
import {RunInfo} from './run-info';

const Container = styled.div`
	position: absolute;
	width: 1920px;
	height: 1080px;
	overflow: hidden;
	display: grid;
	grid-template-columns: 10% 1fr;
	grid-template-rows: 1fr 10%;
`;

const BottomContainer = styled.div`
	grid-column: 2 / 3;
	grid-row: 2 / 3;
	margin-left: 10px;
`;

export const Main: React.StatelessComponent = () => {
	return (
		<Container>
			<Left />
			<BottomContainer>
				<RunInfo />
			</BottomContainer>
		</Container>
	);
};
