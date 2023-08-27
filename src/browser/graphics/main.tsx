import "./styles/global.css";

import {createRoot} from "react-dom/client";

import {Main} from "./components/main";

const rootElement = document.querySelector("#root");
if (rootElement) {
	createRoot(rootElement).render(<Main />);
}
