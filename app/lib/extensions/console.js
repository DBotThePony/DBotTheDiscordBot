
console.errHandler = function(err) {
	if (err !== null)
		console.error(err);
};

console.callback = function() {
	const trace = (new Error()).stack;
	
	return function(err) {
		if (err === null) return;
		console.error(err.trace || err);
		console.error('---------');
		console.error(trace);
	};
};

console.errorHandler = console.errHandler;
console.nerr = console.errHandler;
console.nerror = console.errHandler;
console.merr = console.errHandler;
