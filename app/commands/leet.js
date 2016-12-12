
// http://lurkmo.re/Leet

let charmap = {
	'a': '/-|',
	'b': '8',
	'c': '[',
	'с': '[',
	'd': '|)',
	'e': '3',
	'f': '|=',
	'g': '6',
	'h': '|-|',
	'i': '|',
	'j': ')',
	'k': '|(',
	'l': '1',
	'm': '|\\/|',
	'n': '|\\|',
	'o': '()',
	'p': '|>',
	'р': '|>',
	'q': '9',
	'r': '|2',
	's': '$',
	't': '7',
	'u': '|_|',
	'v': '\\/',
	'w': '\\/\\/',
	'x': '*',
	'y': '\'/',
	'у': '\'/',
	'z': '2',
	'г': 'r',
	'ж': '}|{',
	'з': '\'/_',
	'и': '|/|',
	'л': '/\\',
	'п': '|^|',
	'ф': '<|>',
	'ц': '||_',
	'ч': '\'-|',
	'ш': 'LLI',
	'щ': 'LLL',
	'ъ': '\'b',
	'ы': 'b|',
	'ь': '|o',
	'э': '€',
	'ю': '|-O',
	'я': '9|',
};

let jn = [];

for (let i in charmap)
	jn.push(i);

let charMaxExp = new RegExp('(' + jn.join('|') + ')', 'gi');

module.exports = {
	name: 'leet',
	alias: ['l33t'],
	
	help_args: '<text>',
	desc: 'l33t',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('Phrase needed', 'leet', args, 1);
		
		return cmd.replace(charMaxExp, function(m, p) {
			let l = p.toLowerCase();
			
			if (!charmap[l])
				return m;
			
			return charmap[l];
		});
	}
}
