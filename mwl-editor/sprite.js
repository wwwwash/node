var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var path = require('path');
var imagemin = require('gulp-imagemin');
var buffer = require('vinyl-buffer');

var sites = [
	'docler',
	'jasmin',
	'oranum',
	'sonicbox'
];

module.exports = function() {

	gulp.task('sprite', function(done) {
		var counter = 0;
		sites.forEach(function(site){
			var spriteData = gulp.src(path.join(__dirname, '../../src/image/' + site + '/sprite/*.*'))
				.pipe(spritesmith({
						imgName : 'sprite.png',
						cssName : '__sprite.scss',
						imgPath : '../image/sprite.png'
					})
				);

			var imgStream = spriteData.img.pipe(buffer())
				.pipe(imagemin())
				.pipe(gulp.dest(path.join(__dirname, '../../dist/' + site + '/image/')));

			imgStream.on('end', function() {
				var cssStream = spriteData.css.pipe(gulp.dest(path.join(__dirname, '../../src/scss/' + site +
					'/css/modules')));

				cssStream.on('end', function() {
					counter++;
					if (counter === sites.length) {
						done();
					}
				});
			});
		});
	});
};