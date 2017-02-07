
const crypto = DBot.js.crypto;

String.repeat = function(str, times) {
	let output = '';
	
	for (let i = 0; i < times; i++) {
		output += str;
	}
	
	return output;
};

String.hash = function(str) {
	return crypto.createHash('sha256').update(str).digest('hex');
};

String.hash5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
};

String.hash1 = function(str) {
	return crypto.createHash('sha1').update(str).digest('hex');
};

String.hash512 = function(str) {
	return crypto.createHash('sha512').update(str).digest('hex');
};
