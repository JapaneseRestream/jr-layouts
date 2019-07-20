import React from 'react';
import styled from 'styled-components';

import {CurrentRun} from '../../../nodecg/generated/current-run';

import {FitText, Text as FitTextText} from './fit-text';

const Container = styled.div`
	margin: 8px 5px;
	padding: 5px 5px;
	max-height: 114px;
	overflow: hidden;
	border: 1px solid #fefefe;
`;

const Text = styled(FitText)`
	& > ${FitTextText} {
	}
`;

const Title = styled(Text)`
	font-size: 30px;
	font-weight: 400;
`;

const Misc = styled(Text)`
	font-weight: 400;
	height: 1.25em;
	overflow: hidden;
`;

interface Props {
	run: NonNullable<CurrentRun>;
}

export const GamePlate: React.FunctionComponent<Props> = (props) => {
	const {game} = props.run;
	const misc = [props.run.category, props.run.console]
		.filter(Boolean)
		.join(' - ');

	return (
		<Container>
			<Title text={game} />
			<Misc text={misc} />
		</Container>
	);
};
