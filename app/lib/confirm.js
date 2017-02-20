
// Confirm or Decline actions

const fs = DBot.js.fs;
DBot.PendingConfirm = DBot.PendingConfirm || {};

class Confirm {
	constructor(user, channel) {
		this.user = user;
		this.channel = channel;
		this.server = channel.guild; // If server
		
		this.uid = user.id;
		this.cuid = channel.id;
		
		DBot.PendingConfirm[this.uid] = DBot.PendingConfirm[this.uid] || {};
		DBot.PendingConfirm[this.uid][this.cuid] = this;
	}
	
	echo() {
		let ME = this;
		
		ME.channel.sendMessage('Confirm action? Y/N\n' + (this.title || '') + '\n' + (this.desc || ''))
		.then(function(msg) {
			ME.confMessage = msg;
			if (ME.shouldClear)
				msg.delete(0);
		});
		
		fs.readFile('./resource/files/execute.jpg', {encoding: null}, function(err, data) {
			if (!data)
				return;
			
			ME.channel.sendFile(data, 'skynet_terminator_3.jpg').then(function(msg) {
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
		
		DBot.PendingConfirm[this.uid] = DBot.PendingConfirm[this.uid] || {};
		DBot.PendingConfirm[this.uid][this.cuid] = undefined;
	}
	
	onDeclined() {
		if (this.catch)
			this.catch();
		
		DBot.PendingConfirm[this.uid] = DBot.PendingConfirm[this.uid] || {};
		DBot.PendingConfirm[this.uid][this.cuid] = undefined;
	}
}

hook.Add('CanExecuteCommand', 'Confirm', function(user, command, msg) {
	let uid = user.id;
	let cuid = msg.channel.id;
	
	if (!DBot.PendingConfirm[uid])
		return;
	
	if (!DBot.PendingConfirm[uid][cuid])
		return;
	
	if (command !== 'yes' && command !== 'no' && command !== 'y' && command !== 'n') {
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
	
	func: function(args, cmd, msg) {
		let uid = msg.author.id;
		let cuid = msg.channel.id;
		
		if (!DBot.PendingConfirm[uid])
			return 'No command to confirm at all';
		
		if (!DBot.PendingConfirm[uid][cuid])
			return 'No command to confirm at this channel';
		
		DBot.PendingConfirm[uid][cuid].msgCommand = msg;
		DBot.PendingConfirm[uid][cuid].onConfirmed();
	}
});

DBot.RegisterCommand({
	name: 'no',
	alias: ['n'],
	
	help_args: '',
	desc: 'Nope.avi',
	
	func: function(args, cmd, msg) {
		let uid = msg.author.id;
		let cuid = msg.channel.id;
		
		if (!DBot.PendingConfirm[uid])
			return 'No command to cancel at all';
		
		if (!DBot.PendingConfirm[uid][cuid])
			return 'No command to cancel at this channel';
		
		DBot.PendingConfirm[uid][cuid].msgCommand = msg;
		DBot.PendingConfirm[uid][cuid].onDeclined();
	}
});
