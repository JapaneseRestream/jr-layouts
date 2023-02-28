import React from "react";
import styled from "styled-components";

import {useReplicant} from "../../shared/use-nodecg/use-replicant";

import {FitText} from "./fit-text";

const currentRunRep = nodecg.Replicant("currentRun");

const Container = styled.div`
	position: absolute;
	bottom: 0;
	left: 10%;
	height: 10%;
	width: 80%;
	display: flex;
	flex-flow: column nowrap;
	color: #f3ea84;
	text-shadow: #f3ea84 0px 0px 3px;
`;

const Title = styled(FitText)`
	font-size: 60px;
	font-weight: 900;
`;

const Misc = styled(FitText)`
	font-size: 20px;
	font-weight: 500;
`;

export const RunInfo: React.FunctionComponent = () => {
	const [currentRun] = useReplicant(currentRunRep);
	if (!currentRun) {
		return null;
	}
	const misc = [currentRun.category, currentRun.console]
		.filter(Boolean)
		.join(" - ");
	return (
		<Container>
			<Title text={currentRun.game} />
			<Misc text={misc} />
		</Container>
	);
};
