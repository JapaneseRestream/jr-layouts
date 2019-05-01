import React from 'react';
import {Replicant} from '../../constants';
import {Schedule} from '../../replicants/schedule';
import {CurrentRun} from '../../replicants/current-run';
import {useReplicant} from '../../use-nodecg/use-replicant';
import {GamePlate} from './game-plate';

const GAME_PLATE_AMOUNT = 5;

const scheduleRep = nodecg.Replicant<Schedule>(Replicant.Schedule);
const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);

export const UpcomingList: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep, null);
	const [schedule] = useReplicant(scheduleRep, null);
	if (!currentRun || !schedule) {
		return null;
	}
	const upcomingRuns = schedule.slice(
		currentRun.index + 1,
		currentRun.index + GAME_PLATE_AMOUNT + 1,
	);
	return (
		<>
			{upcomingRuns.map((run) => (
				<GamePlate key={run.index} run={run} />
			))}
		</>
	);
};
