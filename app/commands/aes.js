
// Chars to remap: qwertyuiopasdfghjklzxcvbnm1234567890[];'\,./?-=+!@#$%^&*()~"{}<>

var charMap = [
	'q', 'w', 'e', 'r', 't', 'y', 'u',
	'i', 'o', 'p', 'a', 's', 'd', 'f',
	'g', 'h', 'j', 'k', 'l', 'z', 'x',
	'c', 'v', 'b', 'n', 'm', '1', '2',
	'3', '4', '5', '6', '7', '8', '9',
	'0', '[', ']', ';', '\'', '\\', ',',
	'.', '/', '?', '-', '=', '+', '!',
	'@', '#', '$', '%', '^', '&', '*',
	'(', ')', '~', '"', '{', '}', '<',
	'>'
];

var charMapExp = [
	'q', 'w', 'e', 'r', 't', 'y', 'u',
	'i', 'o', 'p', 'a', 's', 'd', 'f',
	'g', 'h', 'j', 'k', 'l', 'z', 'x',
	'c', 'v', 'b', 'n', 'm', '1', '2',
	'3', '4', '5', '6', '7', '8', '9',
	'0', '\\[', '\\]', ';', '\'', '\\\\', ',',
	'\\.', '/', '\\?', '\\-', '=', '\\+', '!',
	'@', '\\#', '\\$', '%', '\\^', '\\&', '\\*',
	'\\(', '\\)', '~', '"', '\\{', '\\}', '\\﻿<',
	'﻿\\>'
];

var charFullSpace = [ 'ｑ', 'ｗ', 'ｅ', 'ｒ', 'ｔ', 'ｙ', 'ｕ', 'ｉ', 'ｏ', 'ｐ', 'ａ', 'ｓ', 'ｄ', 'ｆ', 'ｇ', 'ｈ', 'ｊ', 'ｋ', 'ｌ', 'ｚ', 'ｘ', 'ｃ', 'ｖ', 'ｂ', 'ｎ', 'ｍ', '１', '２', '３', '４', '５', '６', '７', '８', '９', '０', '［', '］', '；', '＇', '＼', '，', '．', '／', '？', '－', '＝', '＋', '！', '＠', '＃', '＄', '％', '＾', '＆', '＊', '（', '）', '～', '｀', '﻿｛', '﻿｝', '﻿＜', '﻿＞'];

var flipMap = ['b', 'ʍ', 'ǝ', 'ɹ', 'ʇ', 'ʎ', 'n', 'ı', 'o', 'd', 'ɐ', 's', 'p', 'ɟ', 'ƃ', 'ɥ', 'ɾ', 'ʞ', 'ן', 'z', 'x', 'ɔ', 'ʌ', 'q', 'u', 'ɯ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', ';', ',', '\\', '‘', '.', '/', '¿', '-', '=', '+', '¡', '@', '#', '$', '%', '^', '⅋', '*', '(', ')', '~', '"', '{', '}', '<', '>'];
var flopMap = ['p', 'w', 'ɘ', 'ᴙ', 'T', 'Y', 'U', 'i', 'o', 'q', 'A', 'ꙅ', 'b', 'ꟻ', 'g', 'H', 'j', 'k', 'l', 'z', 'x', 'ↄ', 'v', 'd', 'ᴎ', 'm', '߁', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', '⁏', '\'', '\\', ',', '.', '/', '⸮', '-', '=', '+', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '∽', '"', '{', '}', '<', '>', ];

var mappedFull = {};
var mappedFlip = {};
var mappedFlop = {};
var matchMap = '(' + charMapExp.join('|') + ')';
var matchMapExp = new RegExp(matchMap, 'gi');

for (let i in charMap) {
	mappedFull[charMap[i]] = charFullSpace[i];
	mappedFlip[charMap[i]] = flipMap[i];
	mappedFlop[charMap[i]] = flopMap[i];
}

module.exports = {
	name: 'aes',
	alias: ['aesthetics', 'fspace', 'ufspace', 'unicodefullspace', 'ufullspace', 'fullspace'],
	
	argNeeded: true,
	
	help_args: '<phrase>',
	desc: 'A e s t e t i c s',
	
	func: function(args, cmd, msg) {
		return cmd.replace(matchMapExp, function(m) {
			return mappedFull[m] || m;
		});
	},
}

DBot.RegisterCommand({
	name: 'tflip',
	alias: ['textflip'],
	
	argNeeded: true,
	
	help_args: '<phrase>',
	desc: 'Flips?',
	
	func: function(args, cmd, msg) {
		return cmd.replace(matchMapExp, function(m) {
			return mappedFlip[m] || m;
		});
	},
});

DBot.RegisterCommand({
	name: 'tflop',
	alias: ['textflop'],
	
	argNeeded: true,
	
	help_args: '<phrase>',
	desc: 'Flops?',
	
	func: function(args, cmd, msg) {
		return cmd.replace(matchMapExp, function(m) {
			return mappedFlop[m] || m;
		});
	},
});

DBot.RegisterPipe({
	name: 'aes',
	alias: ['aesthetics', 'fspace', 'ufspace', 'unicodefullspace', 'ufullspace', 'fullspace'],
	
	help_args: '<phrase>',
	desc: 'A e s t e t i c s',
	
	func: function(args, cmd, msg) {
		return cmd.replace(matchMapExp, function(m) {
			return mappedFull[m] || m;
		});
	},
});

DBot.RegisterPipe({
	name: 'tflip',
	alias: ['textflip'],
	
	help_args: '<phrase>',
	desc: 'Flips?',
	
	func: function(args, cmd, msg) {
		return cmd.replace(matchMapExp, function(m) {
			return mappedFlip[m] || m;
		});
	},
});

DBot.RegisterPipe({
	name: 'tflop',
	alias: ['textflop'],
	
	help_args: '<phrase>',
	desc: 'Flops?',
	
	func: function(args, cmd, msg) {
		return cmd.replace(matchMapExp, function(m) {
			return mappedFlop[m] || m;
		});
	},
});

