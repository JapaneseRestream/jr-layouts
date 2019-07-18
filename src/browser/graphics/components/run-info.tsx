import React from 'react';
import styled from 'styled-components';

import {useReplicant} from '../../shared/use-nodecg/use-replicant';

import {FitText, Text as FitTextText} from './fit-text';

const currentRunRep = nodecg.Replicant('currentRun');

const Container = styled.div`
	position: absolute;
	bottom: 0;
	left: 10%;
	height: 10%;
	width: 80%;
	display: flex;
	flex-flow: column nowrap;
`;

const Title = styled(FitText)`
	& > ${FitTextText} {
		font-size: 60px;
		font-weight: 900;
	}
`;

const Misc = styled(FitText)`
	& > ${FitTextText} {
		font-size: 20px;
		font-weight: 500;
	}
`;

export const RunInfo: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep);
	if (!currentRun) {
		return null;
	}
	const misc = [currentRun.category, currentRun.console]
		.filter(Boolean)
		.join(' - ');
	return (
		<Container>
			<Title text={currentRun.game || currentRun.english} />
			<Misc text={misc} />
		</Container>
	);
};
