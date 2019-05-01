import React from 'react';
import styled from 'styled-components';
import {Run} from '../../replicants/lib';
import {FitText} from './fit-text';

const Container = styled.div`
	margin: 8px 5px;
	padding: 5px 5px;
	max-height: 114px;
	overflow: hidden;
	background-color: rgba(9, 5, 19, 1);
	border: 1px solid rgb(234, 2, 142);
`;

interface Props {
	run: Run;
}

export const GamePlate: React.FunctionComponent<Props> = (props) => {
	const game = props.run.game || props.run.english || '';
	const misc = [props.run.category, props.run.console]
		.filter(Boolean)
		.join(' - ');

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
