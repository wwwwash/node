var glob = require('glob');
var fs = require('fs');
var path = require('path');

var sassIncludes = function(done) {
	var all = '_all.scss';
	glob(path.join(__dirname, '../../src/+(layouts|scss)/**/' + all), function (error, files) {
		files.forEach(function (allFile) {
			// Add a banner to warn users
			fs.writeFileSync(allFile, '/** This is a dynamically generated file **/\n\n');

			var directory = path.dirname(allFile);
			var partials = fs.readdirSync(directory).filter(function (file) {
				return (
					// Exclude the dynamically generated file
					file !== all &&
					// Only include _*.scss files
					path.basename(file).substring(0, 1) === '_' &&
					path.extname(file) === '.scss'
				);
			});

			// Append var statements for each partial
			partials.forEach(function (partial) {
				fs.appendFileSync(allFile, '@import "' + partial + '";\n');
			});
		});
		done();
	});
};

sassIncludes.displayName = 'sass-includes';

module.exports = sassIncludes;