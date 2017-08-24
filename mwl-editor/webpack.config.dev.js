var webpack = require('webpack');
var path = require('path');
var AsyncModulePlugin = require('async-module-loader/plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var chalk = require('chalk');

var plugins = [
	new AsyncModulePlugin(),
	new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js"),
	new ProgressBarPlugin({
		format: chalk.cyan('webpack build') +
				' [' + chalk.green(':bar') + ']' +
				chalk.green.bold('::percent') +
				' (:msg)',
		width: 30,
		clear: false
	})
];

module.exports = {
	entry   : {
		app    : '../static/src/index.es6',
		vendor : ['jquery', 'chronos', '../static/src/lib/pages/commonPageController.es6']
	},
	output  : {
		path          : path.join(__dirname, '../dist/tmp/js/'),
		filename      : 'bundle.js',
		publicPath    : '/js/',
		chunkFilename : "[id].[chunkhash].bundle.js"
	},
	module  : {
		preLoaders : [
			{
				test    : /\.(js|es6)$/,
				loader  : 'eslint-loader',
				exclude : /node_modules/
			}
		],
		loaders    : [
			{
				test    : /\.(js|es6)$/,
				loader  : 'babel-loader',
				exclude : /node_modules\/(?!(chronos)\/).*/,
				query   : {
					presets : ['es2015']
				}
			},
			{
				test   : /\.hbs$/,
				loader : 'handlebars-loader',
				query  : {
					helperDirs : [path.join(__dirname, '../src/templates', 'helpers')]
				}
			},
			{
				test   : /\.json$/,
				loader : 'json'
			}
		]
	},
	plugins : plugins,
	devtool : 'source-map'
};
