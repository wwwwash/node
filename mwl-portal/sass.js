/**
 * Run with npm
 * npm run sass -- --layout=glamorous
 *
 * Run with gulp
 * ./node_modules/gulp/bin/gulp.js --gulpfile ./build/gulpfile.js sass --layout=honeybunny --color=lolita
 */

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	path = require('path'),
	autoprefixer = require('gulp-autoprefixer'),
	csso = require('gulp-csso'),
	rename = require('gulp-rename'),
	gulpif = require('gulp-if'),
	argv = require('yargs').argv;

var sassTask = function() {
	var inputPath = '../../src/layouts/**/*.scss',
		newName = null,
		outputPath = '../../dist';

	if (argv.layout || argv.color) {
		/*
		 * We can specify a single layout or color to speedup the compilation time.
		 * NOTE: if the color is not one of the available colors for a certain layout,
		 * compilation will be really fast but not effective.
		 */
		var defaults = {
			'layout': 'pure',
			'honeybunny': 'peach',
			'pure': 'purepink',
			'glamorous': 'pinklady',
			'classycandy': 'redwhite',
			'velvet': 'divinepurple'
		};
		var layout = argv.layout || defaults.layout,
			maps = argv.maps !== undefined ? true : false,
			color = argv.color || defaults[layout];
		console.log('Processing ' + layout + ' ' + color + (maps ? ' with maps' : '') + '...');
		inputPath = '../../src/layouts/' + layout + '/css/site.' + color + '.scss';
		outputPath = '../../dist/' + layout + '/css';
		newName = 'site.' + color + '.css';
	}

	return gulp.src(path.join(__dirname, inputPath))
		.pipe(gulpif(maps, sourcemaps.init()))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers : [
				'> 1%',
				'last 2 versions',
				'not ie <= 8',
				'not and_uc > 0',
				'not BlackBerry > 0',
				'not OperaMobile > 0',
				'not OperaMini > 0'
			],
			cascade: false
		}))
		.pipe(gulpif(newName !== null, rename(newName)))
		.pipe(csso())
		.pipe(gulpif(maps, sourcemaps.write()))
		.pipe(gulp.dest(path.join(__dirname, outputPath)));
};

sassTask.displayName = 'sass';

module.exports = sassTask;
