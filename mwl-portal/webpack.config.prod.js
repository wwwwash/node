var webpack = require('webpack');
var path = require('path');
var AsyncModulePlugin = require('async-module-loader/plugin');

var plugins = [
	new webpack.DefinePlugin({
		'process.env': {
			'NODE_ENV': JSON.stringify('production')
		}
	}),
	new AsyncModulePlugin(),
	new webpack.optimize.DedupePlugin(),
	new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js"),
	new webpack.optimize.OccurenceOrderPlugin(),
	new webpack.optimize.UglifyJsPlugin({
		compress : {
			screw_ie8 : true,
			warnings  : false
		}
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
		publicPath    : '/js/',
		chunkFilename : "[id].[hash].bundle.js"
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
					presets : ['es2015']
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
