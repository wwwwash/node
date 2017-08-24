var gulp = require('gulp');
var path = require('path');
var rev = require('gulp-rev');
var CSSUrlOverride = require('gulp-rev-css-url');

var vers = function() {
	return gulp.src([
		path.join(__dirname, '../../dist/[!j][!s]*/**/*'),
		path.join(__dirname, '../../dist/js/bundle.js'),
		path.join(__dirname, '../../dist/js/vendor.js'),
		path.join(__dirname, '../../dist/swf/armageddon-flash-player.swf')
	], {
		base : path.join(__dirname, '../../dist')
	})
		.pipe(rev())
		.pipe(CSSUrlOverride())
		.pipe(gulp.dest(path.join(__dirname, '../../dist')))
		.pipe(rev.manifest())
		.pipe(gulp.dest(path.join(__dirname, '../../dist')));
};

vers.displayName = 'versioning';

module.exports = vers;