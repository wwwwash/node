var gulp = require('gulp');

var copyFonts = function() {
	return gulp.src('../node_modules/armageddon-client/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest('../dist/font'));
};

copyFonts.displayName = 'copy-fonts';

module.exports = copyFonts;