import React, {useState, useEffect} from "react";
import styled from "styled-components";

import {useReplicant} from "../../shared/use-nodecg/use-replicant";

const Container = styled.div`
	position: absolute;
	right: 0;
	bottom: 0;
	height: 10%;
	width: 10%;
	font-size: 20px;
	text-align: center;
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
`;

const HashtagText = styled.div`
	color: #f37f50;
	text-shadow: #f37f50 0px 0px 5px;
	text-transform: uppercase;
`;

export const Clock: React.FunctionComponent = () => {
	const [hashtag] = useReplicant(nodecg.Replicant("hashtag"));
	const [, setTime] = useState("");
	useEffect(() => {
		const TIMEZONE_DIFF_MS =
			nodecg.bundleConfig.timezoneDifference * 60 * 60 * 1000;
		const intervalTimer = setInterval(() => {
			setTime(new Date(Date.now() + TIMEZONE_DIFF_MS).toLocaleString("ja-JP"));
		}, 10);
		return () => {
			clearInterval(intervalTimer);
		};
	}, []);

	return (
		<Container>
			{/* <div>現地: {time}</div> */}
			<HashtagText>{hashtag}</HashtagText>
		</Container>
	);
};
