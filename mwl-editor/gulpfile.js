var gulp = require('gulp');
var sass = require('./tasks/sass');
var sassIncludes = require('./tasks/sass-includes');
var sassWatch = require('./tasks/sass-watch');
var versioning = require('./tasks/versioning');
var sprite = require('./tasks/sprite');
var copyAssets = require('./tasks/copy-assets');

var isProduction = process.env.BUILD_ENVIRONMENT === 'production';

// Default task
var buildTask = ['copy-assets'];

// Tasks in order
gulp.task('default', buildTask);
gulp.task('versioning', versioning);
gulp.task('sprite', isProduction ? ['versioning'] : [], sprite);
gulp.task('sass-includes', ['sprite'], sassIncludes);
gulp.task('sass', ['sass-includes'], sass);
gulp.task('copy-assets', ['sass'], copyAssets);

// Watchers
gulp.task('sass:watch', ['sass'], sassWatch);
