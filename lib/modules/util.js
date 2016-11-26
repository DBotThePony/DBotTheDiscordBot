
Util = {};

var fs = require('fs');

Util.SafeCopy = function(path, to) {
	fs.stat(to, function(err, stat) {
		if (stat)
			return;
		
		fs.createReadStream(path).pipe(fs.createWriteStream(to));
	});
}

TimezoneOffset = function() {
	return (new Date()).getTimezoneOffset() * 60;
}

TimeOffset = TimezoneOffset;
CurTimeOffset = TimezoneOffset;
RealTimeOffset = TimezoneOffset;
SysTimeOffset = TimezoneOffset;

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
			var tryNum = Number(arg);
		
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

Util.Spaces = function(num) {
	var output = '';
	
	for (var i = 0; i < num; i++) {
		output += ' ';
	}
	
	return output;
}

Util.StringRepeat = function(str, times) {
	var output = '';
	
	for (var i = 0; i < times; i++) {
		output += str;
	}
	
	return output;
}

Util.AppendArrays = function(Dest, Source) {
	for (var i in Source) {
		Dest.push(Source[i]);
	}
	
	return Dest;
}

Util.HighlightHelp = function(args, pos, toMerge) {
	var output;
	var output2 = '';
	
	if (toMerge) {
		Util.AppendArrays(args, toMerge);
	}
	
	if (!args[pos - 1]) {
		args[pos - 1] = '<missing>';
	}
	
	for (var i in args) {
		if ((Number(i) + 1) == pos) {
			output2 += Util.StringRepeat('^', args[i].length) + ' ';
		} else {
			output2 += Util.StringRepeat(' ', args[i].length) + ' ';
		}
		
		if (output)
			output += ' ' + args[i];
		else
			output = args[i];
	}
	
	return '\n```' + output + '\n' + output2 + '```';
}

Util.output = function(process) {
	process.stderr.on('data', function(data) {
		console.error(data.toString());
	});
	
	process.stdout.on('data', function(data) {
		console.log(data.toString());
	});
}

Util.Redirectstd = Util.output;
Util.Redirect = Util.output;
