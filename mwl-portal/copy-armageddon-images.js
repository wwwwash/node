var gulp = require('gulp');

var copyArmageddonImages = function() {
	return gulp.src(['../node_modules/armageddon-client/surprises/**/*', '../node_modules/armageddon-client/image/**/*'])
		.pipe(gulp.dest('../dist/image/armageddon'));
};

copyArmageddonImages.displayName = 'copy-armageddon-images';

module.exports = copyArmageddonImages;
