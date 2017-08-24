var gulp = require('gulp');
var sass = require('gulp-sass');
var path = require('path');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');

module.exports = function() {
	return gulp.src(path.join(__dirname, '../../src/scss/**/*.scss'))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers : [
				'> 1%',
				'last 5 versions',
				'not ie <= 9',
				'not and_uc > 0',
				'not BlackBerry > 0',
				'not OperaMobile > 0',
				'not OperaMini > 0'
			],
			cascade  : false
		}))
		.pipe(csso())
		.pipe(gulp.dest(path.join(__dirname, '../../dist')));
};