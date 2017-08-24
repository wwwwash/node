export default function(lvalue, operator, rvalue) { /* eslint func-style: 0 */
	switch (operator) {
		case '==': return lvalue == rvalue; /* eslint eqeqeq: 0 */
		case '<': return lvalue < rvalue;
		case '<=': return lvalue <= rvalue;
		case '>': return lvalue > rvalue;
		case '>=': return lvalue >= rvalue;
		case '!=': return lvalue != rvalue;
		default: return null;
	}
}
