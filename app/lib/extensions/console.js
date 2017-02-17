
console.errHandler = function(err) {
	if (err !== null)
		console.err(err);
};

console.errorHandler = console.errHandler;
