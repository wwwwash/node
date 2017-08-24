var gulp = require('gulp');
var path = require('path');
var rev = require('gulp-rev');
var CSSUrlOverride = require('gulp-rev-css-url');

module.exports = function() {
	return gulp.src([
			path.join(__dirname, '../../dist/font/**/*'),
			path.join(__dirname, '../../dist/image/**/*')
		], {
			base : path.join(__dirname, '../../dist')
		})
		.pipe(rev())
		.pipe(CSSUrlOverride())
		.pipe(gulp.dest(path.join(__dirname, '../../dist')))
		.pipe(rev.manifest())
		.pipe(gulp.dest(path.join(__dirname, '../../dist')));
};
