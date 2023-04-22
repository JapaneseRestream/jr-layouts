import React, {useRef, useEffect} from "react";
import styled from "@emotion/styled";

const Container = styled.div`
	display: flex;
	justify-content: center;
`;

export const Text = styled.div`
	white-space: nowrap;
`;

interface Props {
	text: string;
	style?: React.CSSProperties;
	className?: string;
}

export const FitText: React.FunctionComponent<Props> = (props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);

	const fit = () => {
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
	};

	useEffect(() => {
		const text = textRef.current;
		if (!text) {
			return;
		}
		const {font} = getComputedStyle(text);
		if (!font) {
			fit();
			return;
		}
		let cancelled = false;
		void document.fonts.load(font).then(() => {
			if (!cancelled) {
				fit();
			}
		});
		return () => {
			cancelled = true;
		};
	});

	return (
		<Container
			className={props.className}
			style={props.style}
			ref={containerRef}
		>
			<Text ref={textRef}>{props.text}</Text>
		</Container>
	);
};
