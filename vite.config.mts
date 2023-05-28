import react from "@vitejs/plugin-react";
import nodecg from "./vite-plugin-nodecg.mjs";
import {defineConfig} from "vite";
import esbuild from "rollup-plugin-esbuild";
import externals from "rollup-plugin-node-externals";

export default defineConfig({
	clearScreen: false,
	plugins: [
		react({
			babel: {
				plugins: ["@emotion/babel-plugin"],
			},
		}),
		nodecg({
			bundleName: "jr-layouts",
			dashboard: "./src/browser/dashboard/*.tsx",
			graphics: "./src/browser/graphics/*.tsx",
			extension: {
				input: "./src/extension/index.ts",
				plugins: [esbuild(), externals()],
			},
		}),
	],
});
