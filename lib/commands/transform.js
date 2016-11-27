
module.exports = {
	name: 'transform',
	alias: ['transf', 'textt'],
	
	help_args: '<phrase1> <phrase2>',
	desc: 'Tries to transform one phrase into another',
	
	func: function(args, cmd, rawcmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['transform'], 2, args);
		
		if (!args[1])
			return 'Need second phrase ;w;' + Util.HighlightHelp(['transform'], 3, args);
		
		if (args[0].length > 400)
			return 'Ugh, too big!';
		
		var cont;
		
		for (let i = 1; i < args.length; i++) {
			if (cont)
				cont += ' ' + args[i];
			else
				cont = args[i];
		}
		
		if (cont.length > 400)
			return 'Ugh, too big!';
		
		var compareI = Math.min(args[0].length, cont.length);
		var sameUntil = 0;
		
		for (let i = 0; i < compareI; i++) {
			if (args[0][i] == cont[i])
				sameUntil++;
			else
				break;
		}
		
		if (sameUntil == 0) {
			return 'Strings must be equal at least in the start';
		}
		
		var build = args[0];
		
		for (let i = args[0].length; i >= sameUntil; i--) {
			if (args[0].substr(0, i) == build)
				continue; // wtf
			
			build += '\n' + args[0].substr(0, i);
		}
		
		for (let i = sameUntil + 1; i <= cont.length; i++) {
			build += '\n' + cont.substr(0, i);
		}
		
		if (build.length > 400)
			return 'Ugh, too big!';
		
		return '\n```' + build + '```';
	},
}