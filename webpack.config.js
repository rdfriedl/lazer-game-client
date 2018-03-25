const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const Dotenv = require('dotenv-webpack');

const IS_DEV = process.env.NODE_ENV === "development";

module.exports = {
	output: {
		filename: "[name]-[hash:8].js"
	},
	plugins: [
		new Dotenv(),
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'development',
			SERVER_ADDRESS: null
		}),
		new LodashModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			template: "src/index.ejs",
			title: require("./package.json").name,
			inject: true,
			chunksSortMode: 'dependency'
		}),
	],
	module: {
		rules: [
			{
				test: /three(\/|\\)examples/,
				loader: "imports-loader",
				options: {
					THREE: "three",
				},
				enforce: "pre",
			},
			{
				test: /\.js$/,
				include: [
					/lazer-game-core/
				],
				loader: "source-map-loader",
			},
			{
				test: /\.js$/,
				exclude: [
					/node_modules/,
					/lazer-game-core/
				],
				loader: "babel-loader",
				options: {
					cacheDirectory: true,
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.html$/,
				loader: "html-loader",
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: "file-loader",
				options: { name: "res/img/[name].[hash:8].[ext]" },
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: "file-loader",
				options: { name: "res/fonts/[name].[hash:8].[ext]" },
			},
			{
				test: /\.(mp3|ogg)$/,
				loader: "file-loader",
				options: { name: "static/audio/[name].[hash:8].[ext]" },
			},
			{
				test: /\.json$/,
				loader: "file-loader",
				options: { name: "res/maps/[name].[hash:8].[ext]" },
				include: path.resolve(__dirname, "../src/res/maps"),
			},
			{
				test: /\.ply$/,
				loader: "raw-loader",
			},
		],
	},
	devtool: IS_DEV ? "source-maps" : false,
	devServer: {
		historyApiFallback: true
	}
};
