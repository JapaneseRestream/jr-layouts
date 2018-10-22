/// <reference path="../../../../../types/browser.d.ts" />

import * as React from 'react';
import {Replicant} from '../../../types/bundle';
import {CurrentRun} from '../../../types/schemas/currentRun';
import {Schedule} from '../../../types/schemas/schedule';
import {GamePlate} from './GamePlate';

const scheduleRep = nodecg.Replicant<Schedule>(Replicant.Schedule);
const currentRunRep = nodecg.Replicant<CurrentRun>(Replicant.CurrentRun);

interface State {
	currentRunIndex: number;
	schedule: Schedule;
}

export class UpcomingList extends React.Component<{}, State> {
	state: State = {currentRunIndex: 0, schedule: []};

	componentDidMount() {
		currentRunRep.on('change', this.currentRunHandler);
		scheduleRep.on('change', this.scheduleHandler);
	}
	componentWillUnmount() {
		currentRunRep.removeListener('change', this.currentRunHandler);
		scheduleRep.removeListener('change', this.scheduleHandler);
	}

	private readonly currentRunHandler = (newVal: CurrentRun) => {
		this.setState({currentRunIndex: newVal.index || 0});
	};
	private readonly scheduleHandler = (newVal: Schedule) => {
		this.setState({schedule: newVal});
	};

	private upcomingRuns() {
		return this.state.schedule.filter(
			run =>
				(run.index || 0) > this.state.currentRunIndex &&
				(run.index || 0) < this.state.currentRunIndex + 10
		);
	}

	render() {
		const upcomingRuns = this.upcomingRuns();
		return upcomingRuns.map(run => <GamePlate key={run.index} run={run} />);
	}
}
