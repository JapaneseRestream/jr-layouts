import React from 'react';
import styled from 'styled-components';
import {CurrentRun} from '../../replicants/current-run';
import {Replicant} from '../../constants';
import {useReplicant} from '../../use-nodecg/use-replicant';
import {FitText, Text as FitTextText} from './fit-text';

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

const Title = styled(FitText)`
	& > ${FitTextText} {
		font-size: 60px;
		font-weight: 900;
		background: linear-gradient(to bottom, #fbd379 0%, #e28600 100%);
		-webkit-background-clip: text;
		color: transparent;
		text-shadow: none;
	}
`;

const Misc = styled(FitText)`
	& > ${FitTextText} {
		font-size: 20px;
		font-weight: 500;
		background: linear-gradient(to bottom, #feca66 0%, #fd8022 100%);
		-webkit-background-clip: text;
		color: transparent;
		text-shadow: none;
	}
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
			<Title text={currentRun.game || currentRun.english} />
			<Misc text={misc} />
		</Container>
	);
};
