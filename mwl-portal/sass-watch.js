var gulp = require('gulp'),
	path = require('path'),
	argv = require('yargs').argv;

var sassWatch = function() {
	var layout = argv.layout ? argv.layout + '/**' : '**';
	return gulp.watch(path.join(__dirname, '../../src/layouts/' + layout + '/!(_all).scss'), gulp.series('sass'));
};

sassWatch.displayName = 'sass-watch';

module.exports = sassWatch;