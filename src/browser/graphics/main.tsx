import "./styles/global.css";

import {createRoot} from "react-dom/client";

import {Main} from "./components/main";

createRoot(document.querySelector("#root")!).render(<Main />);
