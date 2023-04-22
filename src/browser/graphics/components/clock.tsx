import React from "react";
import styled from "@emotion/styled";

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
	return (
		<Container>
			<HashtagText>{hashtag}</HashtagText>
		</Container>
	);
};
