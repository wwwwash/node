var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var path = require('path');
var imagemin = require('gulp-imagemin');
var buffer = require('vinyl-buffer');
var merge = require('merge-stream');

var spriteTask = function(done) {

		var spriteData = gulp.src(path.join(__dirname, '../../dist/image/sprite/*.png'))
			.pipe(spritesmith({
					imgName : 'sprite.png',
					cssName : '__sprite.scss',
					imgPath : '../../image/sprite.png'
				})
			);

		var imgStream = spriteData.img
			.pipe(buffer())
			.pipe(imagemin())
			.pipe(gulp.dest(path.join(__dirname, '../../dist/image/')));

		imgStream.on('end', function() {
			// when the sprite minification has done create the output CSS file
			var cssStream = spriteData.css
				.pipe(gulp.dest(path.join(__dirname, '../../src/layouts/common/css')));

			cssStream.on('end', function() {
				done();
			});
		});
};

spriteTask.displayName = 'sprite';

module.exports = spriteTask;