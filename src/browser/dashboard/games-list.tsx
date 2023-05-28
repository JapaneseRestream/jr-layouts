import "./global.css";

import styled from "@emotion/styled";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {useRef, useEffect, createRef} from "react";
import {createRoot} from "react-dom/client";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

const Container = styled.div`
	height: 500px;
	overflow: scroll;
`;

const App: React.FunctionComponent = () => {
	const [currentRun] = useReplicant("current-run");
	const [schedule] = useReplicant("schedule");
	const rowRefs = useRef(schedule?.map(() => createRef<HTMLSpanElement>()));
	useEffect(() => {
		if (!currentRun || !schedule || !rowRefs.current) {
			return;
		}
		const currentRunIndex = schedule.findIndex(
			(run) => run.index === currentRun.index,
		);
		const currentRunRef = rowRefs.current[currentRunIndex];
		if (currentRunRef?.current) {
			currentRunRef.current.scrollIntoView({behavior: "smooth"});
		}
	}, [currentRun, schedule]);

	if (!schedule || !currentRun) {
		return null;
	}

	return (
		<Container>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>ゲーム名</TableCell>
						<TableCell>カテゴリ</TableCell>
						<TableCell>機種</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{schedule.map((run, index) => (
						<TableRow selected={run.index === currentRun.index} key={run.index}>
							<TableCell>
								<span ref={rowRefs.current?.[index]}>{run.game}</span>
							</TableCell>
							<TableCell>{run.category}</TableCell>
							<TableCell>{run.console}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Container>
	);
};

createRoot(document.getElementById("root")!).render(<App />);
