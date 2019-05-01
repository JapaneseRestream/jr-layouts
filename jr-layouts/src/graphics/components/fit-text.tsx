import React, {useRef, useEffect} from 'react';
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

export const FitText: React.FunctionComponent<Props> = (props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		const text = textRef.current;
		if (!container || !text) {
			return;
		}
		const MAX_WIDTH = container.clientWidth;
		const currentWidth = text.clientWidth;
		const scaleX = currentWidth > MAX_WIDTH ? MAX_WIDTH / currentWidth : 1;
		const newTransform = `scaleX(${scaleX})`;
		text.style.transform = newTransform;
	});

	return (
		<Container style={props.style} ref={containerRef}>
			<Text ref={textRef}>{props.text}</Text>
		</Container>
	);
};
