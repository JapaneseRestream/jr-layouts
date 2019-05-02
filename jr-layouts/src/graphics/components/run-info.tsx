import React from 'react';
import styled from 'styled-components';
import {CurrentRun} from '../../replicants/current-run';
import {Replicant} from '../../constants';
import {useReplicant} from '../../use-nodecg/use-replicant';
import {FitText} from './fit-text';

const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);

const Container = styled.div`
	position: absolute;
	bottom: 0;
	left: 10%;
	height: 10%;
	width: 80%;
	display: flex;
	flex-flow: column nowrap;
`;

export const RunInfo: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep, null);
	if (!currentRun) {
		return null;
	}
	const misc = [currentRun.category, currentRun.console]
		.filter(Boolean)
		.join(' - ');
	return (
		<Container>
			<FitText
				style={{fontSize: '60px', fontWeight: 900}}
				text={currentRun.game || currentRun.english}
			/>
			<FitText style={{fontSize: '20px', fontWeight: 500}} text={misc} />
		</Container>
	);
};
