const config = module.exports = {
	apiConfig : {
		url : ''
	},
	engineConfig : {
		basePath   : '/',
		publicPath : 'https://localhost.dhdevel.com:3000/'
	}
};

if (process.env.BUILD_ENV === 'production') {
	config.engineConfig.publicPath = './';
}