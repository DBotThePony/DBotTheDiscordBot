
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const fs = DBot.js.filesystem;

module.exports = {
	name: 'nfs',
	alias: ['needforsleep'],
	
	help_args: '',
	desc: 'Need For Sleep',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		fs.readFile('./resource/files/nfs.png', {encoding: null}, function(err, data) {
			if (!data)
				return;
			
			if (msg.wasDeleted)
				return;
			
			msg.channel.sendFile(data, 'nfs.jpg').then(function(msg2) {
				if (msg.wasDeleted)
					msg2.delete(0);
				else {
					msg.replies = msg.replies || [];
					msg.replies.push(msg2);
				}
			});
		});
	}
}
