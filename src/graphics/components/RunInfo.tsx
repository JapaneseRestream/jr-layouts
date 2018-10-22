import * as React from 'react';
import styled from 'styled-components';
import {CurrentRun} from '../../../types/schemas/currentRun';
import {FitText} from './FitText';

const currentRunRep = nodecg.Replicant<CurrentRun>('currentRun');

const Container = styled.div`
	display: grid;
	color: #ffd56c;
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

interface State {
	game: string;
	category: string;
	console: string;
	commentator: string;
}

export class RunInfo extends React.Component<{}, State> {
	state: State = {game: '', category: '', console: '', commentator: ''};

	componentDidMount() {
		currentRunRep.on('change', this.currentRunHandler);
	}
	componentWillUnmount() {
		currentRunRep.removeListener('change', this.currentRunHandler);
	}

	private readonly currentRunHandler = (newVal: CurrentRun) => {
		this.setState({
			game: newVal.game || newVal.english || '',
			category: newVal.category || '',
			console: newVal.console || '',
			commentator: newVal.commentator || '',
		});
	};

	render() {
		let misc = `カテゴリー：${this.state.category}`;
		if (this.state.console) {
			misc += ` | 機種：${this.state.console}`;
		}
		const {commentator} = this.state;
		return (
			<Container>
				<FitText
					style={{fontSize: '70px', fontWeight: 900}}
					text={this.state.game}
				/>
				<FitText
					style={{fontSize: '25px', fontWeight: 500}}
					text={misc}
				/>
				{commentator && (
					<CommentatorContainer>
						<Title>解説</Title>
						<Content>{commentator}</Content>
					</CommentatorContainer>
				)}
			</Container>
		);
	}
}
