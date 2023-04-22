import type {Manifest, ResolvedConfig, UserConfigExport} from "vite";
import type {InputOptions, OutputOptions} from "rollup";
import type {Plugin} from "vite";
import react from "@vitejs/plugin-react";
import globby from "globby";
import path from "path";
import fs from "fs";
import * as cheerio from "cheerio";
import {deleteSync} from "del";

type PluginConfig = {
	bundleName: string;
	graphics?: string | string[];
	dashboard?: string | string[];
	template?: string;
};

const nodecg = ({
	bundleName,
	graphics = [],
	dashboard = [],
	template = "./src/template.html",
}: PluginConfig): Plugin => {
	let config: ResolvedConfig;
	let portPromise: Promise<number>;
	let inputOptions: InputOptions;
	let outputOptions: OutputOptions;

	const graphicsInputs = globby.sync(graphics);
	const dashboardInputs = globby.sync(dashboard);

	const generateHtmlFiles = async () => {
		const templateHtml = fs.readFileSync(
			path.join(config.root, template),
			"utf-8",
		);
		const resolvedInputs =
			typeof inputOptions.input === "string"
				? [inputOptions.input]
				: Array.isArray(inputOptions.input)
				? inputOptions.input
				: inputOptions.input
				? Object.values(inputOptions.input)
				: [];

		const graphicsOutdir = path.join(config.root, "graphics");
		const dashboardOutdir = path.join(config.root, "dashboard");

		deleteSync([`${graphicsOutdir}/**`, `${dashboardOutdir}/**`]);
		fs.mkdirSync(graphicsOutdir, {recursive: true});
		fs.mkdirSync(dashboardOutdir, {recursive: true});

		for (const input of resolvedInputs) {
			const inputName = input.replace(/^\.\//, "");
			const $ = cheerio.load(templateHtml);
			const head = $("head");
			if (config.mode === "development") {
				const protocol = config.server.https ? "https" : "http";
				const host = config.server.host ?? "localhost";
				const port = await portPromise;
				const address = `${protocol}://${host}:${port}`;
				head.append(`
					<script type="module">
						import RefreshRuntime from '${new URL(
							path.join(config.base, "@react-refresh"),
							address,
						)}'
						RefreshRuntime.injectIntoGlobalHook(window)
						window.$RefreshReg$ = () => {}
						window.$RefreshSig$ = () => (type) => type
						window.__vite_plugin_react_preamble_installed__ = true
					</script>
				`);
				head.append(
					`<script type="module" src="${new URL(
						path.join(config.base, "@vite/client"),
						address,
					)}"></script>`,
				);
				head.append(
					`<script type="module" src="${new URL(
						path.join(config.base, inputName),
						address,
					)}"></script>`,
				);
			}
			if (config.mode === "production") {
				const manifest: Manifest = JSON.parse(
					fs.readFileSync(
						path.join(outputOptions.dir!, "manifest.json"),
						"utf-8",
					),
				);
				const entryChunk = manifest[inputName];

				if (entryChunk.css) {
					for (const css of entryChunk.css) {
						head.append(
							`<link rel="stylesheet" href="${path.join(
								config.base,
								config.build.outDir,
								css,
							)}">`,
						);
					}
				}

				head.append(
					`<script type="module" src="${path.join(
						config.base,
						config.build.outDir,
						entryChunk.file,
					)}"></script>`,
				);
			}

			const newHtml = $.html();
			const dir = graphicsInputs.includes(input)
				? graphicsOutdir
				: dashboardOutdir;
			const name = path.basename(input, path.extname(input));
			fs.writeFileSync(path.join(dir, `${name}.html`), newHtml);
		}
	};

	return {
		name: "nodecg",

		config: () => {
			return {
				base: `/bundles/${bundleName}/`,
				build: {
					rollupOptions: {
						input: [...graphicsInputs, ...dashboardInputs],
					},
					manifest: true,
					outDir: "./shared/dist",
					assetsDir: ".",
				},
			};
		},
		configResolved: (resolvedConfig) => {
			config = resolvedConfig;
		},
		configureServer: (server) => {
			portPromise = new Promise((resolve) => {
				server.httpServer?.once("listening", () => {
					resolve(server.config.server.port ?? 3000);
				});
			});
		},

		buildStart: (resolvedInputOptions) => {
			inputOptions = resolvedInputOptions;
			if (config.command === "serve") {
				generateHtmlFiles();
			}
		},

		writeBundle: (resolvedOutputOptions) => {
			outputOptions = resolvedOutputOptions;
			if (config.command === "build") {
				generateHtmlFiles();
			}
		},
	};
};

const config: UserConfigExport = {
	plugins: [
		react(),
		nodecg({
			bundleName: "jr-layouts",
			dashboard: "./src/browser/dashboard/*.tsx",
			graphics: "./src/browser/graphics/*.tsx",
		}),
	],
};

export default config;
