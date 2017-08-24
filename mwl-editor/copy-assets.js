var gulp = require('gulp');
var path = require('path');

var sites = [
	'jasmin',
	'docler',
	'oranum',
	'sonicbox'
];

module.exports = function () {
	gulp.task('copy-assets', function (done) {
		sites.forEach(function (site) {
			// JS files
			gulp.src(path.join(__dirname, '../../dist/tmp/js/*'))
				.pipe(gulp.dest('../dist/' + site + '/js'));
			// Font files
			gulp.src('../src/font/*.{eot,svg,ttf,woff,woff2}')
				.pipe(gulp.dest('../dist/' + site + '/font'));
			// Images
			gulp.src('../src/image/' + site + '/logo/*.*')
				.pipe(gulp.dest('../dist/' + site + '/image/logo'))
		});
		done();
	});
};