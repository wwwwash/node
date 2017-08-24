const path = require('path');
const webpack = require('webpack');
const config = require('./config');
const fs = require('fs');

const MOMENT_LOCALES = /^\.\/(en-gb|hu|es|de|it|pt|nl|sv|da|fi|ja|ru|cs|sk|ro|pl|zh-cn)$/;

module.exports = {
	devtool : 'eval-source-map',
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
	devServer : {
		contentBase        : path.join(__dirname, 'public'),
		publicPath         : 'https://localhost.dhdevel.com:3000/',
		port               : 3000,
		inline             : true,
		historyApiFallback : true,
		hot                : true,
		host               : 'localhost.dhdevel.com',
		https              : {
			key  : fs.readFileSync('./wildcard.dhdevel.com.key'),
			cert : fs.readFileSync('./wildcard.dhdevel.com.crt')
		},
		stats              : {
			chunks : false
		},
		headers : {
			'Access-Control-Allow-Origin'      : '*',
			'Access-Control-Allow-Credentials' : 'true',
			'Access-Control-Allow-Headers'     : 'Content-Type, Authorization, x-id, Content-Length, X-Requested-With',
			'Access-Control-Allow-Methods'     : 'GET, POST, PUT, DELETE, OPTIONS'
		}
	},
	watchOptions : {
		ignored : /node_modules/
	},
	plugins : [
		new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, MOMENT_LOCALES),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin()
	],
	resolve : {
		extensions  : ['.js', '.scss'],
		alias       : {},
		unsafeCache : /node_modules|lib/
	},
	module : {
		rules : [
			{
				enforce : 'pre',
				test    : /\.js$/,
				use     : 'eslint-loader',
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
							],
							cacheDirectory : true
						}
					}
				]
			},
			{
				test : /\.scss$/,
				use  : ['style-loader', 'css-loader?&sourceMap&modules&camelCase&importLoaders=2&localIdentName=[local]___[hash:base64:5]', 'sass-loader?sourceMap'] // eslint-disable-line
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
