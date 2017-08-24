process.env.NODE_ENV = process.env.BUILD_ENV = 'production';

const path = require('path');
const webpack = require('webpack');
const WriteFile = require('write-file-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const config = require('./config');

const mqpacker = require('css-mqpacker');
const PostcssAssetsPlugin = require('postcss-assets-webpack-plugin');

const extractSassPlugin = new ExtractTextPlugin({
	filename    : '[name].css',
	allChunks   : true,
	ignoreOrder : true
});

module.exports = {
	devtool : 'nosources-source-map',
	entry   : {
		app : [
			'babel-polyfill',
			'whatwg-fetch',
			'url-search-params-polyfill',
			'./src/component/App/App.js'
		]
	},
	output : {
		path          : path.join(__dirname, 'web', 'jasmin', 'cache'),
		filename      : '[name].js',
		publicPath    : config.engineConfig.publicPath,
		chunkFilename : 'app.chunk[id].[chunkhash].js?v=[hash]'
	},
	plugins : [
		new WriteFile({ log : false }),
		extractSassPlugin,
		new PostcssAssetsPlugin({
			test    : /\.css$/,
			log     : true,
			plugins : [
				// Pack same CSS media query rules into one media query rule
				mqpacker
			]
		}),
		new webpack.DefinePlugin({
			'process.env' : {
				NODE_ENV  : JSON.stringify(process.env.NODE_ENV),
				BUILD_ENV : JSON.stringify(process.env.BUILD_ENV)
			}
		})
	],
	resolve : {
		extensions : ['.js', '.scss'],
		alias      : {
			'jquery.ui.widget' : 'blueimp-file-upload/js/vendor/jquery.ui.widget.js'
		}
	},
	module : {
		rules : [
			{
				enforce : 'pre',
				test    : /\.js$/,
				use     : 'webpack-strip-block',
				exclude : /node_modules/
			},
			{
				enforce : 'pre',
				test    : /\.js$/,
				use     : [{
					loader  : 'eslint-loader',
					options : {
						failOnWarning : true,
						failOnError   : true
					}
				}],
				exclude : /node_modules|lib/
			},
			{
				test    : /\.js$/,
				include : path.join(__dirname, 'src'),
				exclude : /node_modules/,
				use     : [
					{
						loader  : 'babel-loader',
						options : {
							plugins : [
								'syntax-dynamic-import',
								'transform-remove-strict-mode',
								'transform-class-properties',
								'transform-object-assign',
								'syntax-decorators',
								'transform-decorators-legacy',
								'syntax-async-functions',
								'transform-regenerator',
								'transform-function-bind'
							],
							presets : [
								['env', {
									targets : {
										browsers : [
											'last 2 versions',
											'safari >= 7'
										],
										modules : false
									}
								}],
								'stage-1'
							]
						}
					}
				]
			},
			{
				test   : /\.s?css$/,
				loader : extractSassPlugin.extract({
					fallback : 'style-loader',
					use      : [
						{
							loader : 'css-loader',
							query  : {
								minimize      : true,
								modules       : true,
								camelCase     : true,
								importLoaders : 2
							}
						},
						{
							loader : 'sass-loader'
						}
					]
				})
			},
			{
				test: /\.(gif|png|jpe?g)$/i,
				loaders: [
					'file-loader?hash=sha512&digest=hex&name=[name].[hash].[ext]',
					{
						loader: 'image-webpack-loader',
						query: {
							bypassOnDebug : true
						}
					}
				]
			},
			{
				test : /\.svg$/,
				use  : 'url-loader?limit=65000&mimetype=image/svg+xml&name=[name].[ext]'
			},
			{
				test : /\.woff$/,
				use  : 'url-loader?limit=65000&mimetype=application/font-woff&name=[name].[ext]'
			},
			{
				test : /\.woff2$/,
				use  : 'url-loader?limit=65000&mimetype=application/font-woff2&name=[name].[ext]'
			},
			{
				test : /\.[ot]tf$/,
				use  : 'url-loader?limit=65000&mimetype=application/octet-stream&name=[name].[ext]'
			},
			{
				test : /\.eot$/,
				use  : 'url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=[name].[ext]'
			}
		]
	}
};

// show a message to impatient devs
setTimeout(() => {
	console.log('\n\x1b[44m\x1b[97m', 'Generating production build, this might take a while...', '\x1b[39m\x1b[0m\n');
}, 3000);
