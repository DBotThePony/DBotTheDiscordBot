
/* global DBot */

const filesToReload = [
	'../lib/sql_classes.js',
	'../lib/sql_functions.js',
	'../lib/sql_helpers.js',
	'../lib/imagick.js',
	'../lib/confirm.js',
	'../lib/util.js',
	'../commands.js'
];

module.exports = {
	name: 'reload',
	
	help_args: '',
	desc: 'Reloads some of code, reloads all commands',
	
	func: function(args, cmd, msg) {
		if (!DBot.owners.includes(msg.author.id))
			return 'Bot owner only';
		
		msg.channel.startTyping();
		let cTime = CurTime();
		
		for (const file of filesToReload) {
			try {
				let recursiveFunc = function(data) {
					if (data === undefined) return;
					delete require.cache[data.id];
					
					for (const ch of data.children)
						recursiveFunc(ch);
				};
				
				recursiveFunc(require.cache[require.resolve(file)]);
				
				require(file);
			} catch(err) {
				msg.channel.stopTyping();
				msg.sendMessage('```' + err.stack + '```');
				return;
			}
		}
		
		msg.channel.stopTyping();
		return 'Reload successfull. Done in ' + Math.floor((CurTime() - cTime) * 1000) + ' milliseconds.';
	}
};
