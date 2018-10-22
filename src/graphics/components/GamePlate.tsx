import * as React from 'react';
import styled from 'styled-components';
import {CurrentRun} from '../../../types/schemas/currentRun';
import {FitText} from './FitText';

const Container = styled.div`
	margin: 8px 5px;
	padding: 5px 5px;
	max-height: 114px;
	overflow: hidden;
	background-color: rgba(9, 5, 19, 1);
	border: 1px solid rgb(234, 2, 142);
`;

interface Props {
	run: CurrentRun;
}

export const GamePlate: React.StatelessComponent<Props> = ({run}) => {
	const game = run.game || run.english || '';
	let misc = run.category || '';
	if (run.console) {
		misc += `- ${run.console}`;
	}
	return (
		<Container>
			<FitText style={{fontSize: '30px', fontWeight: 500}} text={game} />
			<FitText
				style={{fontWeight: 400, height: '1.25em', overflow: 'hidden'}}
				text={misc}
			/>
		</Container>
	);
};
