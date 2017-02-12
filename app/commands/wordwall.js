
const font = 'Hack-Regular';
const size = 48;

module.exports = {
	name: 'wordwall',
	alias: ['wwall'],
	
	help_args: '<phrase>',
	desc: 'Wally',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['wordwall'], 2, args);
		
		if (cmd.length > 1000)
			return 'the fuck?';
		
		let len = cmd.length;
		let build = '\n';
		
		for (let i = 0; i <= len; i++) {
			build += '\n' + cmd.substr(i) + ' ' + cmd.substr(0, i);
		}
		
		return '```' + build + '```';
	},
}

DBot.RegisterCommand({
	name: 'iwordwall',
	alias: ['iwwall'],
	
	help_args: '<phrase>',
	desc: 'Wally',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['wordwall'], 2, args);
		
		if (cmd.length > 400)
			return 'the fuck? Try usual `wordwall`';
		
		let len = cmd.length;
		let build = '';
		
		for (let i = 0; i <= len; i++) {
			build += '\n' + cmd.substr(i) + ' ' + cmd.substr(0, i);
		}
		
		IMagick.DrawText({
			text: build,
			font: font,
			size: size,
		}, function(err, fpath, fpathU) {
			if (err) {
				msg.reply('<internal pony error>');
			} else {
				msg.reply(fpathU);
			}
		});
	},
});
