
// Confirm or Decline actions

var fs = require('fs');
var Pending = {};

class Confirm {
	constructor(user, channel) {
		this.user = user;
		this.channel = channel;
		this.server = channel.guild; // If server
		
		this.uid = user.id;
		this.cuid = channel.id;
		
		Pending[this.uid] = Pending[this.uid] || {};
		Pending[this.uid][this.cuid] = this;
	}
	
	echo() {
		var ME = this;
		
		ME.channel.sendMessage('Confirm action? Y/N\n' + (this.title || '') + '\n' + (this.desc || ''))
		.then(function(msg) {
			ME.confMessage = msg;
			if (ME.shouldClear)
				msg.delete(0);
		});
		
		fs.readFile('./resource/files/execute.jpg', {encoding: null}, function(err, data) {
			if (!data)
				return;
			
			ME.channel.sendFile(data, 'yn.jpg').then(function(msg) {
				ME.confMessage2 = msg;
				if (ME.shouldClear)
					msg.delete(0);
			});
		});
	}
	
	clearMessages() {
		this.shouldClear = true;
		
		if (this.confMessage)
			this.confMessage.delete(0);
		
		if (this.confMessage2)
			this.confMessage2.delete(0);

		if (this.msgCommand && this.msgCommand.deletable)
			this.msgCommand.delete(0);
	}
	
	setTitle(title) {
		this.title = title;
		return this;
	}
	
	setDesc(desc) {
		this.desc = desc;
		return this;
	}
	
	then(func) {
		this.then = func;
		return this;
	}
	
	catch(func) {
		this.catch = func;
		return this;
	}
	
	confirm(func) {
		this.then = func;
		return this;
	}
	
	decline(func) {
		this.catch = func;
		return this;
	}
	
	onConfirmed() {
		if (this.then)
			this.then();
		
		Pending[this.uid] = Pending[this.uid] || {};
		Pending[this.uid][this.cuid] = undefined;
	}
	
	onDeclined() {
		if (this.catch)
			this.catch();
		
		Pending[this.uid] = Pending[this.uid] || {};
		Pending[this.uid][this.cuid] = undefined;
	}
}

hook.Add('CanExecuteCommand', 'Confirm', function(user, command, msg) {
	var uid = user.id;
	var cuid = msg.channel.id;
	
	if (!Pending[uid])
		return;
	
	if (!Pending[uid][cuid])
		return;
	
	if (command != 'yes' && command != 'no' && command != 'y' && command != 'n') {
		msg.reply('Confirm previous action Y/N');
		return false;
	}
});

DBot.Confirm = Confirm;

DBot.RegisterCommand({
	name: 'yes',
	alias: ['y'],
	
	help_args: '',
	desc: 'YES',
	
	func: function(args, cmd, rawcmd, msg) {
		var uid = msg.author.id;
		var cuid = msg.channel.id;
		
		if (!Pending[uid])
			return 'No command to confirm at all';
		
		if (!Pending[uid][cuid])
			return 'No command to confirm at this channel';
		
		Pending[uid][cuid].msgCommand = msg;
		Pending[uid][cuid].onConfirmed();
	}
});

DBot.RegisterCommand({
	name: 'no',
	alias: ['n'],
	
	help_args: '',
	desc: 'Nope.avi',
	
	func: function(args, cmd, rawcmd, msg) {
		var uid = msg.author.id;
		var cuid = msg.channel.id;
		
		if (!Pending[uid])
			return 'No command to cancel at all';
		
		if (!Pending[uid][cuid])
			return 'No command to cancel at this channel';
		
		Pending[uid][cuid].msgCommand = msg;
		Pending[uid][cuid].onDeclined();
	}
});
