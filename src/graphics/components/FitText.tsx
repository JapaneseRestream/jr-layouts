import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
	display: flex;
	justify-content: center;
`;

const Text = styled.div`
	white-space: nowrap;
`;

interface Props {
	text: string;
	style?: React.CSSProperties;
}

export class FitText extends React.Component<Props> {
	// tslint:disable no-any
	private containerRef = React.createRef<any>();
	private textRef = React.createRef<any>();
	// tslint:enable no-any

	componentDidMount() {
		this.adjustTextWidth();
	}
	componentDidUpdate() {
		this.adjustTextWidth();
	}

	private adjustTextWidth() {
		const container = this.containerRef.current;
		const text = this.textRef.current;
		if (!container || !text) {
			return;
		}
		const MAX_WIDTH = container.clientWidth;
		const currentWidth = text.clientWidth;
		const scaleX = currentWidth > MAX_WIDTH ? MAX_WIDTH / currentWidth : 1;
		text.style.transform = `scaleX(${scaleX})`;
	}

	render() {
		return (
			<Container style={this.props.style} ref={this.containerRef}>
				<Text ref={this.textRef}>{this.props.text}</Text>
			</Container>
		);
	}
}
