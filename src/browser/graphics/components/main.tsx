import React from "react";
import styled from "@emotion/styled";

import {Left} from "./left";
import {RunInfo} from "./run-info";
import {Clock} from "./clock";

const Container = styled.div`
	position: absolute;
	width: 1920px;
	height: 1080px;
	overflow: hidden;
`;

export const Main: React.FunctionComponent = () => {
	return (
		<Container>
			<Left />
			<RunInfo />
			<Clock />
		</Container>
	);
};
