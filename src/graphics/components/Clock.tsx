import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
	font-size: 20px;
	text-align: center;
`;

interface State {
	time: string;
}

export class Clock extends React.Component<{}, State> {
	state: State = {time: ''};
	timer?: NodeJS.Timeout;

	componentDidMount() {
		this.timer = setInterval(() => {
			const now = Date.now();
			const time = new Date(now - 16 * 60 * 60 * 1000).toLocaleString(
				'ja-JP'
			);
			this.setState(state => {
				if (state.time === time) {
					return;
				}
				return {time};
			});
		}, 10);
	}
	componentWillUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	render() {
		return <Container>現地: {this.state.time}</Container>;
	}
}
