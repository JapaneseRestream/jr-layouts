import styled from "@emotion/styled";
import React from "react";

import {useReplicant} from "../../shared/use-nodecg/use-replicant";

import {FitText} from "./fit-text";

const Container = styled.div`
	position: absolute;
	bottom: 0;
	left: 10%;
	height: 10%;
	width: 80%;
	display: flex;
	flex-flow: column nowrap;
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
	const [game] = useReplicant("current-run", (currentRun) => currentRun?.game);
	const [misc] = useReplicant(
		"current-run",
		(currentRun) =>
			currentRun && `${currentRun.category} - ${currentRun.console}`,
	);
	return (
		<Container>
			<Title text={game ?? ""} />
			<Misc text={misc ?? ""} />
		</Container>
	);
};
