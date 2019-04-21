import React from 'react';
import styled from 'styled-components';
import {CurrentRun} from '../../replicants/current-run';
import {Replicant} from '../../constants';
import {useReplicant} from '../../use-nodecg/use-replicant';
import {FitText} from './fit-text';

const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);

const Container = styled.div`
	display: grid;
	grid-template-columns: auto 300px;
	grid-template-rows: auto auto auto;
	grid-auto-flow: column;
`;

const Title = styled.div``;
const Content = styled.div``;
const CommentatorContainer = styled.div`
	grid-row: 1 / 3;
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	& > ${Title} {
		font-size: 20px;
		font-weight: 400;
	}
	& > ${Content} {
		font-size: 30px;
		font-weight: 600;
	}
`;

export const RunInfo: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep, null);
	if (!currentRun) {
		return null;
	}
	let misc = `カテゴリー：${currentRun.category}`;
	if (currentRun.console) {
		misc += ` | 機種：${currentRun.console}`;
	}
	return (
		<Container>
			<FitText
				style={{fontSize: '70px', fontWeight: 900}}
				text={currentRun.game || currentRun.english}
			/>
			<FitText style={{fontSize: '25px', fontWeight: 500}} text={misc} />
			{currentRun.commentator && (
				<CommentatorContainer>
					<Title>解説</Title>
					<Content>{currentRun.commentator}</Content>
				</CommentatorContainer>
			)}
		</Container>
	);
};
