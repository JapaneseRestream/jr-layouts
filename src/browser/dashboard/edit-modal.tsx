import "./global.css";

import TextField from "@mui/material/TextField";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import {useState, useEffect} from "react";
import {createRoot} from "react-dom/client";
import styled from "@emotion/styled";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

const currentRunRep = nodecg.Replicant("currentRun");

const Container = styled.div`
	margin: 8px;
	display: grid;
	grid-auto-flow: row;
	gap: 16px;
`;

const theme = createTheme({
	palette: {
		mode: "dark",
	},
});

const App: React.FunctionComponent = () => {
	const [currentRun, setCurrentRun] = useReplicant(currentRunRep);
	const [game, updateGame] = useState("");
	const [category, updateCategory] = useState("");
	const [commentator, updateCommentator] = useState("");
	useEffect(() => {
		const onOpen = () => {
			if (!currentRun) {
				return;
			}
			updateGame(currentRun.game);
			updateCategory(currentRun.category);
			updateCommentator(currentRun.commentator);
		};
		const onConfirm = () => {
			if (!currentRun) {
				return;
			}
			setCurrentRun({...currentRun, game, category, commentator});
		};
		document.addEventListener("dialog-opened", onOpen);
		document.addEventListener("dialog-confirmed", onConfirm);
		return () => {
			document.removeEventListener("dialog-opened", onOpen);
			document.removeEventListener("dialog-confirmed", onConfirm);
		};
	});
	if (!currentRun) {
		return null;
	}
	return (
		<Container>
			<ThemeProvider theme={theme}>
				<TextField
					label='ゲーム'
					value={game}
					onChange={(changeEvent) => {
						updateGame(changeEvent.target.value);
					}}
				/>
				<TextField
					label='カテゴリー'
					value={category}
					onChange={(changeEvent) => {
						updateCategory(changeEvent.target.value);
					}}
				/>
				<TextField
					label='解説'
					value={commentator}
					onChange={(changeEvent) => {
						updateCommentator(changeEvent.target.value);
					}}
				/>
			</ThemeProvider>
		</Container>
	);
};

createRoot(document.querySelector("#root")!).render(<App />);
