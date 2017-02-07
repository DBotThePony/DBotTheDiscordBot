
const mathRegStrict = /^-?[0-9]+$/;
const mathReg = /^-?[0-9]+/;

Number.from = function(arg) {
	let num;
	
	if (typeof arg === 'string') {
		if (arg.match(mathRegStrict)) {
			let tryNum = parseInt(arg);
		
			if (tryNum === tryNum) { // NaN ???
				num = tryNum;
			}
		}
	} else if (typeof arg === 'number') {
		return arg;
	}
	
	return num;
};

Number.weakFrom = function(arg) {
	let num;
	
	if (typeof arg === 'string') {
		let match = arg.match(mathReg);
		if (match) {
			let tryNum = parseInt(match[0]);
		
			if (tryNum === tryNum) { // NaN ???
				num = tryNum;
			}
		}
	} else if (typeof arg === 'number') {
		return arg;
	}
	
	return num;
};