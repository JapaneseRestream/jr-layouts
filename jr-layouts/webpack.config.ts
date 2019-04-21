import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import globby from 'globby';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

const isProduction = process.env.NODE_ENV === 'production';

const base: webpack.Configuration = {
	mode: isProduction ? 'production' : 'development',
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
	},
	plugins: [new CleanWebpackPlugin()],
	devtool: 'cheap-source-map',
};

const extension: webpack.Configuration = merge(base, {
	name: 'extension',
	target: 'node',
	context: __dirname,
	entry: './src/extension/index.ts',
	output: {
		path: path.resolve(__dirname, 'extension'),
		filename: 'index.js',
		libraryTarget: 'commonjs2',
	},
	module: {
		rules: [
			{
				test: /\.ts$/u,
				loader: 'ts-loader',
				options: {
					configFile: 'tsconfig.extension.json',
				},
			},
		],
	},
	externals: [nodeExternals()],
	optimization: {
		minimize: false,
	},
});

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
					test: /\.(png)$/u,
					loaders: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[contenthash].[ext]',
							},
						},
					],
				},
			],
		},
		plugins: [
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
						minChunks: 4,
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
	extension,
	generateBrowserConfig('dashboard'),
	generateBrowserConfig('graphics'),
];
