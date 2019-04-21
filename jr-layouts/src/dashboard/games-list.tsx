import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from '@material-ui/core';
import React, {useRef, useEffect, createRef} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {CurrentRun} from '../replicants/current-run';
import {Schedule} from '../replicants/schedule';
import {Replicant} from '../constants';
import {useReplicant} from '../use-nodecg/use-replicant';

const scheduleRep = nodecg.Replicant<Schedule>(Replicant.Schedule);
const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);

const Container = styled.div`
	height: ${window.parent.innerHeight - 200}px;
	overflow: scroll;
`;

const App: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep, null);
	const [schedule] = useReplicant(scheduleRep, null);
	const rowRefs = useRef(
		schedule && schedule.map(() => createRef<HTMLSpanElement>()),
	);
	useEffect(() => {
		if (!currentRun || !schedule || !rowRefs.current) {
			return;
		}
		const currentRunIndex = schedule.findIndex(
			(run) => run.index === currentRun.index,
		);
		const currentRunRef = rowRefs.current[currentRunIndex];
		if (currentRunRef && currentRunRef.current) {
			currentRunRef.current.scrollIntoView({behavior: 'smooth'});
		}
	}, [currentRun, schedule]);
	if (!schedule || !currentRun) {
		return null;
	}
	return (
		<Container>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>開始時刻</TableCell>
						<TableCell>ゲーム名</TableCell>
						<TableCell>カテゴリ</TableCell>
						<TableCell>走者</TableCell>
						<TableCell>解説</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{schedule.map((run, index) => (
						<TableRow
							selected={run.index === currentRun.index}
							key={run.index}
						>
							<TableCell>
								{run.scheduled &&
									new Date(run.scheduled).toLocaleString()}
							</TableCell>
							<TableCell>
								<span
									ref={
										rowRefs.current &&
										rowRefs.current[index]
									}
								>
									{run.game || run.english}
								</span>
							</TableCell>
							<TableCell>{run.category}</TableCell>
							<TableCell>{run.runners}</TableCell>
							<TableCell>{run.commentator}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Container>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
