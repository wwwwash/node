var gulp = require('gulp');
var sass = require('./tasks/sass');
var sassIncludes = require('./tasks/sass-includes');
var sassWatch = require('./tasks/sass-watch');
var versioning = require('./tasks/versioning');
var sprite = require('./tasks/sprite');
var copyFonts = require('./tasks/copy-fonts');
var copyArmageddonImages = require('./tasks/copy-armageddon-images');
var copyArmageddonFlash = require('./tasks/copy-armageddon-flash');

var isProduction = process.env.BUILD_ENVIRONMENT === 'production';

// Watchers
gulp.task('sass:watch', gulp.series(
	sass,
	sassWatch
));

gulp.task('copiers', gulp.parallel(
	copyFonts,
	copyArmageddonImages,
	copyArmageddonFlash
));

gulp.task('css-series', gulp.series(
	sprite,
	sassIncludes,
	sass,
	isProduction ? versioning : []
));

gulp.task(
	'default',
	gulp.parallel(
		'copiers',
		'css-series'
	)
);

// Individual tasks for DEV
gulp.task('sass', sass);
gulp.task('sassIncludes', sassIncludes);