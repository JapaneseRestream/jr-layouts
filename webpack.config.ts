import path from 'path';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';
import globby from 'globby';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

const isProduction = process.env.NODE_ENV === 'production';

const base: webpack.Configuration = {
	mode: isProduction ? 'production' : 'development',
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
	},
	devtool: 'cheap-source-map',
};

const browserConfig = (name: string): webpack.Configuration => {
	const entryFiles = globby.sync(`./src/browser/${name}/*.tsx`);
	const entry: {[x: string]: string} = {};
	for (const file of entryFiles) {
		entry[path.basename(file, '.tsx')] = file;
	}
	const config: webpack.Configuration = merge(base, {
		entry,
		output: {
			path: path.resolve(__dirname, name),
			filename: '[name].js',
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/u,
					loaders: [
						'babel-loader',
						{
							loader: 'ts-loader',
							options: {
								transpileOnly: true,
								compilerOptions: {
									jsx: 'react',
									module: 'esnext',
								},
							},
						},
					],
				},
				{
					test: /\.(png|woff2)$/u,
					loaders: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
							},
						},
					],
				},
				{
					test: /\.css$/u,
					loaders: [MiniCssExtractPlugin.loader, 'css-loader'],
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
			...Object.keys(entry).map(
				(entryName) =>
					new HtmlWebpackPlugin({
						filename: `${entryName}.html`,
						chunks: [entryName],
						title: entryName,
						template: `webpack-templates/${name}.html`,
					}) as any,
			),
			new BundleAnalyzerPlugin({
				openAnalyzer: false,
				analyzerMode: 'static',
				reportFilename: path.resolve(
					__dirname,
					`bundle-analyzer/${name}.html`,
				),
			}),
		],
		optimization: {
			splitChunks: {
				chunks: 'all',
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
	target: 'node',
	entry: path.resolve(__dirname, 'src/extension/index.ts'),
	output: {
		path: path.resolve(__dirname, 'extension'),
		filename: 'index.js',
		libraryTarget: 'commonjs2',
	},
	module: {
		rules: [
			{
				test: /\.ts$/u,
				loaders: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true,
						},
					},
				],
			},
		],
	},
	externals: [nodeExternals()],
});

const config: webpack.Configuration[] = [
	browserConfig('dashboard'),
	browserConfig('graphics'),
	extensionConfig,
];

export default config;
