var gulp = require('gulp');
var path = require('path');

module.exports = function() {
	gulp.watch(path.join(__dirname, '../../src/scss/**/!(_all).scss'), ['sass']);
};