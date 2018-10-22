/// <reference path="../../../../types/browser.d.ts" />

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import {CurrentRun} from '../../types/schemas/currentRun';
import {Schedule} from '../../types/schemas/schedule';

const scheduleRep = nodecg.Replicant<Schedule>('schedule');
const currentRunRep = nodecg.Replicant<CurrentRun>('currentRun');

const Container = styled.div`
	height: ${window.parent.innerHeight - 200}px;
	overflow: scroll;
`;

interface State {
	currentRun: CurrentRun;
	schedule: Schedule;
}

class App extends React.Component<{}, State> {
	state: State = {currentRun: {}, schedule: []};
	rowRefs: Array<React.RefObject<HTMLSpanElement>> = [];

	componentDidMount() {
		currentRunRep.on('change', this.currentRunHandler);
		scheduleRep.on('change', this.scheduleHandler);
		setTimeout(this.scrollToCurrentRun, 1000);
	}
	componentWillUnmount() {
		currentRunRep.removeListener('change', this.currentRunHandler);
		scheduleRep.removeListener('change', this.scheduleHandler);
	}
	componentDidUpdate() {
		this.scrollToCurrentRun();
	}

	private readonly currentRunHandler = (newVal: CurrentRun) => {
		this.setState({currentRun: newVal});
	};
	private readonly scheduleHandler = (newVal: Schedule) => {
		this.setState({schedule: newVal});
	};
	private readonly scrollToCurrentRun = () => {
		const currentRunIndex = this.state.schedule.findIndex(
			run => run.index === this.state.currentRun.index
		);
		const currentRunRef = this.rowRefs[currentRunIndex];
		if (currentRunRef && currentRunRef.current) {
			currentRunRef.current.scrollIntoView({behavior: 'smooth'});
		}
	};

	render() {
		this.rowRefs = this.state.schedule.map(() =>
			React.createRef<HTMLSpanElement>()
		);
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
						{this.state.schedule.map((run, index) => (
							<TableRow
								selected={
									run.index === this.state.currentRun.index
								}
								key={run.index}
							>
								<TableCell>
									{run.scheduled &&
										new Date(
											run.scheduled
										).toLocaleString()}
								</TableCell>
								<TableCell>
									<span ref={this.rowRefs[index]}>
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
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
