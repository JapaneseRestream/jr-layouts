import "./global.css";

import styled from "@emotion/styled";
import TextField from "@mui/material/TextField";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import {useState, useEffect} from "react";
import {createRoot} from "react-dom/client";

import {useReplicant} from "../shared/use-nodecg/use-replicant";

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
	const [currentRun, setCurrentRun] = useReplicant("current-run");
	const [game, updateGame] = useState("");
	const [category, updateCategory] = useState("");
	const [platform, updatePlatform] = useState("");

	useEffect(() => {
		const onOpen = () => {
			if (!currentRun) {
				return;
			}
			updateGame(currentRun.game);
			updateCategory(currentRun.category);
			updatePlatform(currentRun.console);
		};
		const onConfirm = () => {
			if (!currentRun) {
				return;
			}
			setCurrentRun({...currentRun, game, category, console: platform});
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
					onChange={({currentTarget}) => {
						updateGame(currentTarget.value);
					}}
				/>
				<TextField
					label='カテゴリー'
					value={category}
					onChange={({currentTarget}) => {
						updateCategory(currentTarget.value);
					}}
				/>
				<TextField
					label='機種'
					value={platform}
					onChange={({currentTarget}) => {
						updatePlatform(currentTarget.value);
					}}
				/>
			</ThemeProvider>
		</Container>
	);
};

const rootElement = document.querySelector("#root");
if (rootElement) {
	createRoot(rootElement).render(<App />);
}
