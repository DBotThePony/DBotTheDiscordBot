
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

module.exports = {
	name: 'wipe',
	
	help_args: '[user or @images]',
	desc: 'Wipes messages in current channel\nI need MANAGE_MESSAGES permissions to do that!',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Must execute in server channel ;n;';
		
		let me = DBot.FindMeInChannel(msg.channel);
		
		if (!me)
			return '<internal pony error>';
		
		if (!msg.member.hasPermission('MANAGE_MESSAGES') && !DBot.owners.includes(msg.author.id))
			return 'You must have MANAGE_MESSAGES permission!';
		
		if (!me.hasPermission('MANAGE_MESSAGES'))
			return 'I must have MANAGE_MESSAGES permission ;n;';
		
		let filterType = 0;
		let filterID;
		
		if (args[0] == '@images')
			filterType = 1;
		else if (typeof args[0] == 'object') {
			filterID = args[0].id;
			filterType = 2;
		}
		
		let conf = new DBot.Confirm(msg.author, msg.channel);
		
		conf.setTitle('Wipe of messages');
		conf.setDesc('');
		
		conf.confirm(function() {
			conf.clearMessages();
			
			msg.channel.fetchMessages({limit: 100})
			.then(function() {
				let messages = msg.channel.messages;
				let arr = messages.array();
				if (!arr[0]) {
					msg.channel.sendMessage('No messages to remove? WTF');
					return;
				}
				
				let filtered = [];
				
				for (let i in arr) {
					if (!arr[i].deletable)
						continue;
					
					if (filtered.length > 100)
						break;
					
					if (filterType == 0)
						filtered.push(arr[i]);
					else if (filterType == 1) {
						if (arr[i].attachments && arr[i].attachments.array().length > 0)
							filtered.push(arr[i]);
					} else if (filterType == 2) {
						if (arr[i].author.id == filterID) {
							filtered.push(arr[i]);
						}
					}
				}
				
				if (!filtered[0]) {
					msg.channel.sendMessage('No messages matched to be removed.');
					return;
				}
				
				let continueDelete = function() {
					for (let i in filtered) {
						if (i == 0)
							continue;
						
						filtered[i].delete(0);
					}
				}
				
				filtered[0].delete(0).then(continueDelete)
				.catch(function(mess) {
					if (mess.status == 404) {
						continueDelete();
						return;
					}
					
					msg.channel.sendMessage('Can\'t delete ;n;');
				});
			});
		});
		
		conf.decline(function() {
			msg.reply('Aborting');
		});
		
		conf.echo();
	},
}

DBot.RegisterCommand({
	name: 'purge',
	alias: ['prune'],
	
	help_args: '<amount>',
	desc: 'Wipes messages in current channel\nI need MANAGE_MESSAGES permissions to do that!\nSimilar to wipe command, but deletes always all messages\nand have adjustable limit',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Must execute in server channel ;n;';
		
		let amount = Number.from(args[0]) || 30;
		let me = DBot.FindMeInChannel(msg.channel);
		
		if (!me)
			return '<internal pony error>';
		
		if (!msg.member.hasPermission('MANAGE_MESSAGES') && !DBot.owners.includes(msg.author.id))
			return 'You must have MANAGE_MESSAGES permission!';
		
		if (!me.hasPermission('MANAGE_MESSAGES'))
			return 'I must have MANAGE_MESSAGES permission ;n;';
		
		let conf = new DBot.Confirm(msg.author, msg.channel);
		
		conf.setTitle('Purge of messages');
		conf.setDesc('Delete last ' + amount + ' messages');
		
		conf.confirm(function() {
			conf.clearMessages();
			
			msg.channel.fetchMessages({limit: 100})
			.then(function() {
				let messages = msg.channel.messages;
				let arr = messages.array();
				if (!arr[0]) {
					msg.channel.sendMessage('No messages to remove? WTF');
					return;
				}
				
				let filtered = [];
				
				for (let i in arr) {
					if (!arr[i].deletable)
						continue;
					
					filtered.push(arr[i]);
					
					if (filtered.length > amount)
						break;
				}
				
				if (!filtered[0]) {
					msg.channel.sendMessage('No messages matched to be removed.');
					return;
				}
				
				let continueDelete = function() {
					for (let i in filtered) {
						if (i == 0)
							continue;
						
						filtered[i].delete(0);
					}
				}
				
				filtered[0].delete(0).then(continueDelete)
				.catch(function(mess) {
					if (mess.status == 404) {
						continueDelete();
						return;
					}
					
					msg.channel.sendMessage('Can\'t delete ;n;');
				});
			});
		});
		
		conf.decline(function() {
			msg.reply('Aborting');
		});
		
		conf.echo();
	},
});
