
Util = {};

var fs = require('fs');

Util.SafeCopy = function(path, to) {
	fs.stat(to, function(err, stat) {
		if (stat)
			return;
		
		fs.createReadStream(path).pipe(fs.createWriteStream(to));
	});
}

var emptyFunc = function() {}

Util.CreateDirectory = function(path, callback) {
	callback = callback || emptyFunc;
	fs.stat(path, function(err, stat) {
		if (stat) {
			callback();
		} else {
			fs.mkdir(path, function() {callback();});
		}
	});
}

Util.mkdir = Util.CreateDirectory
Util.CreateDir = Util.CreateDirectory

Util.Concat = function(obj, sep) {
	sep = sep || '';
	var first = true;
	var out = '';
	
	for (var i in obj) {
		var item = obj[i];
		
		if (first) {
			first = false;
			out = item;
		} else {
			out += sep + item;
		}
	}
	
	return out;
}
