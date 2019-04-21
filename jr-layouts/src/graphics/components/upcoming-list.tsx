import React from 'react';
import {Replicant} from '../../constants';
import {Schedule} from '../../replicants/schedule';
import {CurrentRun} from '../../replicants/current-run';
import {useReplicant} from '../../use-nodecg/use-replicant';
import {GamePlate} from './game-plate';

const scheduleRep = nodecg.Replicant<Schedule>(Replicant.Schedule);
const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);

export const UpcomingList: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep, null);
	const [schedule] = useReplicant(scheduleRep, null);
	if (!currentRun || !schedule) {
		return null;
	}
	const upcomingRuns = schedule.filter(
		(run) =>
			(run.index || 0) > currentRun.index &&
			(run.index || 0) < currentRun.index + 10,
	);
	return (
		<>
			{upcomingRuns.map((run) => (
				<GamePlate key={run.index} run={run} />
			))}
		</>
	);
};
