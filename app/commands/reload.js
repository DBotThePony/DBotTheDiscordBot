
/* global DBot */

const filesToReload = [
	'../lib/sql_classes.js',
	'../lib/sql_functions.js',
	'../lib/sql_helpers.js',
	'../lib/imagick.js',
	'../lib/confirm.js',
	'../lib/util.js',
	'../lib/member_storage.js',
	'../commands.js',
	'../generic.js',
	'../modules/jlogs.js',
	'../modules/nlogs.js'
];

const globalReload = [
	['../lib/mathhelper.js', 'MathHelper'],
	['../lib/commandhelper.js', 'CommandHelper']
];

function requireReload(file) {
	const recursiveFunc = function(data) {
		if (data === undefined) return;
		delete require.cache[data.id];

		for (const ch of data.children)
			recursiveFunc(ch);
	};

	recursiveFunc(require.cache[require.resolve(file)]);
}

global.requireReload = requireReload;

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
				requireReload(file);
				require(file);
			} catch(err) {
				console.error(err);
				msg.sendMessage('```' + err.stack + '```');
			}
		}
		
		
		for (const file of globalReload) {
			try {
				requireReload(file[0]);
				global[file[1]] = require(file[0]);
			} catch(err) {
				console.error(err);
				msg.sendMessage('```' + err.stack + '```');
			}
		}
		
		msg.channel.stopTyping();
		return 'Reload finished in ' + Math.floor((CurTime() - cTime) * 1000) + ' milliseconds.';
	}
};
