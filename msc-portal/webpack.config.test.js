const path = require('path');

module.exports = {
	target: 'web',
	devtool: 'source-map',
	entry: './spec.js',
	watchOptions : {
		ignored : /node_modules/
	},
	plugins : [],
	resolve : {
		extensions  : ['.js', '.scss'],
		alias       : {},
		unsafeCache : /lib/
	},
	module : {
		rules : [
			{
				enforce : 'pre',
				test    : /\.spec\.js$/,
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
				test : /\.png|\.jpg|\.gif|\.svg|\.scss$/,
				use  : 'null-loader'
			}
		]
	}
};