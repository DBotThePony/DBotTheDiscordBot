
/* global DBot */

Util = {};
util = Util;

const fs = DBot.js.fs;
const utf8 = require('utf8');

Util.SafeCopy = function(path, to) {
	fs.stat(to, function(err, stat) {
		if (stat)
			return;
		
		fs.createReadStream(path).pipe(fs.createWriteStream(to));
	});
};

TimezoneOffset = function() {
	return (new Date()).getTimezoneOffset() * 60;
};

TimeOffset = TimezoneOffset;
CurTimeOffset = TimezoneOffset;
RealTimeOffset = TimezoneOffset;
SysTimeOffset = TimezoneOffset;

const emptyFunc = function() {};

Util.CreateDirectory = function(path, callback) {
	callback = callback || emptyFunc;
	fs.stat(path, function(err, stat) {
		if (stat) {
			callback();
		} else {
			fs.mkdir(path, function() {callback();});
		}
	});
};

Util.truncate = function(path, callback) {
	callback = callback || emptyFunc;
	
	fs.stat(path, function(err, stat) {
		if (!stat) {
			callback();
		} else {
			fs.readdir(path, function(err, list) {
				let done = 0;
				for (const file of list) {
					fs.unlink(file, function() {
						done++;
						if (done === list.length)
							callback();
					});
				}
			});
		}
	});
};

Util.mkdir = Util.CreateDirectory
Util.CreateDir = Util.CreateDirectory

Util.Concat = function(obj, sep) {
	sep = sep || '';
	let first = true;
	let out = '';
	
	for (let i in obj) {
		let item = obj[i];
		
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
	let num;
	
	if (typeof arg == 'string') {
		if (arg.match(/^-?[0-9]+$/)) {
			let tryNum = parseInt(arg);
		
			if (tryNum == tryNum) { // NaN ???
				num = tryNum;
			}
		}
	} else if (typeof arg == 'number') {
		return arg;
	}
	
	return num;
}

// Returns valid number or nothing, but casts even if string is not totaly a number

Util.ToNumberSoft = function(arg) {
	let num;
	
	if (typeof arg == 'string') {
		let match = arg.match(/^-?[0-9]+/);
		if (match) {
			let tryNum = parseInt(match[0]);
		
			if (tryNum == tryNum) { // NaN ???
				num = tryNum;
			}
		}
	} else if (typeof arg == 'number') {
		return arg;
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
	let output = '';
	
	for (let i = 0; i < num; i++) {
		output += ' ';
	}
	
	return output;
}

Util.StringRepeat = function(str, times) {
	let output = '';
	
	for (let i = 0; i < times; i++) {
		output += str;
	}
	
	return output;
}

Util.AppendSpaces = function(str, target) {
	return str.toString() + Util.StringRepeat(' ', target - str.toString().length);
}

Util.AppendArrays = function(Dest, Source) {
	for (let i in Source) {
		Dest.push(Source[i]);
	}
	
	return Dest;
}

Util.CopyArray = function(Source) {
	let Dest = [];
	
	for (let i in Source) {
		Dest.push(Source[i]);
	}
	
	return Dest;
}

Util.HighlightHelp = function(args, pos, toMerge, noTilds) {
	let output;
	let output2 = '';
	
	if (toMerge) {
		Util.AppendArrays(args, toMerge);
	}
	
	if (!args[pos - 1]) {
		args[pos - 1] = '<missing>';
	}
	
	if (args.join('').length > 100) {
		for (let i in args) {
			let str = args[i];
			
			if (typeof args[i] == 'object') { // Assume user
				str = '<@' + args[i].id + '> ';
			}
			
			if (output)
				output += str;
			else
				output = '\n' + str + '\n';
			
			if ((Number(i) + 1) == pos)
				output += '  <----- \n' + Util.StringRepeat('^', str.length) + '\n';
			else
				output += '\n';
		}
	} else {
		for (let i in args) {
			let str = args[i];
			
			if (typeof args[i] == 'object') { // Assume user
				str = '<@' + args[i].id + '>';
			}
			
			if ((Number(i) + 1) == pos) {
				output2 += Util.StringRepeat('^', str.length) + ' ';
			} else {
				output2 += Util.StringRepeat(' ', str.length) + ' ';
			}
			
			if (output)
				output += ' ' + str;
			else
				output = str;
		}
	}
	
	if (!noTilds)
		return '\n```' + output + '\n' + output2 + '```';
	else
		return output + '\n' + output2;
}

Util.output = function(process2) {
	process2.stderr.pipe(process.stdout);
	process2.stdout.pipe(process.stdout);
}

Util.Redirectstd = Util.output;
Util.Redirect = Util.output;
Util.redirect = Util.output;

const replaceBlocks = [
	[/&/gi, '&amp;'],
	[/"/gi, '&quot;'],
	[/'/gi, '&#039;'],
	[/</gi, '&lt;'],
	[/>/gi, '&gt;'],
	
	[/\*\*(([^*][^*])*)\*\*/gi, '<b>$1</b>'],
	[/\*(([^\*])*)\*/gi, '<i>$1</i>'],
	[/```(([^"][^"][^"])*)```/gi, '<span class="codeblock">$1</span>'],
	[/[^"]"(([^"])*)"[^"]/gi, '<span class="codeblock_s">$1</span>'],
	[/\n/gi, '<br>'],
];

Util.ParseMarkdown = function(str) {
	let output = str;
	
	for (let i in replaceBlocks) {
		output = output.replace(replaceBlocks[i][0], replaceBlocks[i][1]);
	}
	
	return output;
}

Util.HaveValue = function(arr, val) {
	for (let i in arr) {
		if (arr[i] == val)
			return true;
	}
	
	return false;
}

Util.escape = function(str) {
	if (typeof str == 'boolean')
		return str && "true" || "false";
	
	if (typeof str == 'number')
		return "" + str + "";
	
	let strObj = str.toString()
	.replace(/'/gi, '\'\'')
	.replace(/\\/gi, '\\\\')
	.replace(/\//gi, '\/');
	
	strObj = '\'' + strObj + '\'';
	
	return strObj;
}

Util.HasValue = Util.HaveValue;

Util.BuildArgumentsString = function(arr) {
	let newArr = [];
	
	for (let arg of arr) {
		newArr.push('"' +
			String(arg)
			.replace(/\\/, '\\\\')
			.replace(/\(/, '\\(')
			.replace(/\)/, '\\)')
			.replace(/'/, '\\\'')
			.replace(/\$/, '\\$')
			.replace(/#/, '\\#')
		+ '"');
	}
	
	return newArr.join(' ');
}

Util.ReadString = function(buf, offestStart) {
	let output = '';
	
	for (let i = offestStart; i < buf.length; i++) {
		let Char = String.fromCharCode(buf[i]);
		
		if (Char != '\0') {
			output += Char;
		} else {
			return [utf8.decode(output), i - offestStart + 1];
		}
	}
	
	return [utf8.decode(output), i - offestStart + 1];
}

Util.MonospaceText = function(x, y, text, size, spaceMult) {
	let reply = '';
	
	for (let i in text) {
		let Char = text[i];
		
		if (Char == '\\')
			Char = '\\\\';
		
		if (Char == '"')
			Char = '\\"';
		
		reply += ' text ' + (x + i * size * spaceMult) + ',' + y + ' "' + Char + '"';
	}
	
	return reply;
}

Util.parseHexColor = function(hex) {
	let toParse = hex;
	
	if (hex.substr(0, 1) == '#') {
		toParse = hex.substr(1);
	}
	
	let red = parseInt(toParse.substr(0, 2), 16);
	let green = parseInt(toParse.substr(2, 2), 16);
	let blue = parseInt(toParse.substr(5, 2), 16);
	
	return [red, green, blue];
}

Util.WrapText = function(text, limit) {
	limit = limit || 120;
	let explode = text.split(/( |\n)+/gi);
	let lines = [];
	let cline = 0;
	let curr = 0;
	
	for (let word of explode) {
		curr += word.length + 1;
		
		if (lines[cline])
			lines[cline] += ' ' + word;
		else
			lines[cline] = word;
		
		if (curr >= limit) {
			cline++;
			curr = 0;
		}
	}
	
	return lines.join('\n');
}
