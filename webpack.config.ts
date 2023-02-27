import path from "path";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import type webpack from "webpack";
import merge from "webpack-merge";
import globby from "globby";
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer";
import HtmlWebpackPlugin from "html-webpack-plugin";
import nodeExternals from "webpack-node-externals";
import Webpackbar from "webpackbar";
import {CleanWebpackPlugin} from "clean-webpack-plugin";

const isProduction = process.env.NODE_ENV === "production";

const base: webpack.Configuration = {
	mode: isProduction ? "production" : "development",
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
	},
	devtool: "cheap-source-map",
	stats: "errors-warnings",
};

const browserConfig = (name: string): webpack.Configuration => {
	const entryFiles = globby.sync(`./src/browser/${name}/*.tsx`);
	const entry: Record<string, string> = {};
	for (const file of entryFiles) {
		entry[path.basename(file, ".tsx")] = file;
	}
	const config: webpack.Configuration = merge(base, {
		entry,
		output: {
			path: path.resolve(__dirname, name),
			publicPath: "./",
			filename: "[name].js",
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/u,
					use: [
						"babel-loader",
						{
							loader: "ts-loader",
							options: {
								transpileOnly: true,
								compilerOptions: {
									jsx: "react",
									module: "esnext",
								},
							},
						},
					],
				},
				{
					test: /\.(png|woff2|gif)$/u,
					type: "asset/resource",
				},
				{
					test: /\.css$/u,
					use: [MiniCssExtractPlugin.loader, "css-loader"],
				},
			],
		},
		plugins: [
			new CleanWebpackPlugin(),
			new MiniCssExtractPlugin({
				filename: "[name].css",
			}),
			...Object.keys(entry).map(
				(entryName) =>
					new HtmlWebpackPlugin({
						filename: `${entryName}.html`,
						chunks: [entryName],
						title: entryName,
						template: `webpack-templates/${name}.html`,
					}),
			),
			new BundleAnalyzerPlugin({
				openAnalyzer: false,
				analyzerMode: "static",
				reportFilename: path.resolve(__dirname, `bundle-analyzer/${name}.html`),
			}),
			new Webpackbar({name, color: "green"}),
		],
		optimization: {
			splitChunks: {
				chunks: "all",
				cacheGroups: {
					common: {
						minChunks: 2,
					},
					vendors: false,
					default: false,
				},
			},
		},
	});
	return config;
};

const extensionConfig: webpack.Configuration = merge(base, {
	target: "node",
	entry: path.resolve(__dirname, "src/extension/index.ts"),
	output: {
		path: path.resolve(__dirname, "extension"),
		filename: "index.js",
		libraryTarget: "commonjs2",
	},
	module: {
		rules: [
			{
				test: /\.ts$/u,
				use: [
					{
						loader: "ts-loader",
						options: {
							transpileOnly: true,
						},
					},
				],
			},
		],
	},
	externals: [nodeExternals()],
	plugins: [new Webpackbar({name: "extension", color: "blue"})],
});

const config: webpack.Configuration[] = [
	browserConfig("dashboard"),
	browserConfig("graphics"),
	extensionConfig,
];

export default config;
