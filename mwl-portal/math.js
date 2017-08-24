export default function(lvalue, operator, rvalue) { /* eslint func-style: 0 */
	lvalue = parseFloat(lvalue);
	rvalue = parseFloat(rvalue);

	switch (operator) {
		case '+': return lvalue + rvalue;
		case '-': return lvalue - rvalue;
		case '*': return lvalue * rvalue;
		case '/': return lvalue / rvalue;
		case '%': return lvalue % rvalue;
		default: return null;
	}
}
