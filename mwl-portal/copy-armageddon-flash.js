var gulp = require('gulp');

var copyArmageddonFlash = function() {
	return gulp.src(['../node_modules/armageddon-client/armageddon-flash-player.swf'])
		.pipe(gulp.dest('../dist/swf'));
};

copyArmageddonFlash.displayName = 'copy-armageddon-flash';

module.exports = copyArmageddonFlash;
