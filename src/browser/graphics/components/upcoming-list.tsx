import React from "react";

import {useReplicant} from "../../shared/use-nodecg/use-replicant";

import {GamePlate} from "./game-plate";

const GAME_PLATE_AMOUNT = 5;

export const UpcomingList: React.FunctionComponent = () => {
	const [currentRun] = useReplicant("current-run");
	const [schedule] = useReplicant("schedule");
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
