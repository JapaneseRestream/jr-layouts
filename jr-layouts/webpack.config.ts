import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';
import globby from 'globby';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

const base: webpack.Configuration = {
	mode: isProduction ? 'production' : 'development',
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
	},
	devtool: 'cheap-source-map',
};

const generateBrowserConfig = (
	name: 'dashboard' | 'graphics',
): webpack.Configuration => {
	const entryFiles = globby.sync(`./src/${name}/*.tsx`);
	const entryObject: {[x: string]: string} = {};
	for (const file of entryFiles) {
		entryObject[path.basename(file, '.tsx')] = file;
	}
	const config: webpack.Configuration = merge(base, {
		name,
		target: 'web',
		context: __dirname,
		entry: entryObject,
		output: {
			path: path.resolve(__dirname, name),
			filename: '[name].[contenthash].js',
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
								configFile: `tsconfig.${name}.json`,
							},
						},
					],
				},
				{
					test: /\.png$/u,
					loaders: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[contenthash].[ext]',
							},
						},
					],
				},
				{
					test: /\.css$/u,
					loaders: [MiniCssExtractPlugin.loader, 'css-loader'],
				},
				{
					test: /\.woff2$/u,
					loaders: ['url-loader'],
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: '[name].[contenthash].css',
			}),
			...Object.keys(entryObject).map(
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
				analyzerMode: isProduction ? 'static' : 'disabled',
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
						minChunks: entryFiles.length,
					},
					vendors: false,
					default: false,
				},
			},
		},
	});
	return config;
};

export default [
	generateBrowserConfig('dashboard'),
	generateBrowserConfig('graphics'),
];
