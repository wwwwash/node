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
		vendor : [
			'jquery',
			'chronos',
			'../static/src/lib/pages/commonPageController.es6',
			'../static/src/lib/pages/commonPageModel.es6',
			'../static/src/lib/vendor/swfobject',
			// from armageddon-client
			'armageddon-client/nanoplayer.pack.min.js',
			'armageddon-client/nano.webrtc.4.5.5.js'
		]
	},
	output  : {
		path          : path.join(__dirname, '../dist/js/'),
		filename      : 'bundle.js',
		publicPath    : '/js/'
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
				exclude : /(node_modules\/(?!(chronos)\/)|swfobject).*/,
				query   : {
					// NOTE: to get better debugging on the browser see
					// http://stackoverflow.com/questions/32211649/debugging-with-webpack-es6-and-babel
					// But we could not use it because it breaks some imports (e.g. import BodyComponent in routeHelper)
					// It might be because of the way we export Singletons. Further investigation is needed
					"presets": [
						"es2015"
					]
				}
			},
			{
				test   : /\.hbs$/,
				loader : 'handlebars-loader',
				query  : {
					helperDirs  : [path.join(__dirname, '../src/templates', 'helpers')],
					partialDirs : [path.join(__dirname, '../src/layouts/')]
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
