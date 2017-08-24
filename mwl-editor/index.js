import handlebars from 'handlebars/runtime';

import toUppercaseHelper from './toUppercase.js';
import i18n from './i18n.js';
import splitter from './splitter.js';
import isEqual from './isEqual.js';

handlebars.default.registerHelper('toUppercase', toUppercaseHelper);
handlebars.default.registerHelper('i18n', i18n);
handlebars.default.registerHelper('splitter', splitter);
handlebars.default.registerHelper('isEqual', isEqual);
