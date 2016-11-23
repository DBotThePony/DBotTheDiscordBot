
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

// Returns valid number or nothing

Util.ToNumber = function(arg) {
	var num;
	
	if (arg) {
		if (arg.match(/^[0-9]+$/)) {
			var tryNum = Number(args[0]);
		
			if (tryNum == tryNum) { // NaN ???
				if (tryNum <= 0)
					tryNum = 1;
				
				num = tryNum;
			}
		}
	}
	
	return num;
}

Util.Random = function(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

Util.RandomArray = function(arr) {
	return arr[Util.Random(0, arr.length - 1)];
}
