import urlHelper from '../../lib/helpers/routeHelper.es6';

export default function(route, options = {}) { /* eslint func-style: 0 */
	let variables = options.hash;
	return urlHelper.resolve(route, variables);
}
