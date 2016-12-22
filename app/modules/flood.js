
cvars.ChannelVar('noflood', '0', [FCVAR_BOOLONLY], 'Try to prevent channel flooding');
cvars.ChannelVar('flood_newlines', '15', [FCVAR_NUMERSONLY_UINT], 'Limit of new lines in one messages');
cvars.ChannelVar('flood_newlines_thersold', '75', [FCVAR_NUMERSONLY_UINT], 'Max of all new lines in all messages for last x seconds');
cvars.ChannelVar('flood_newlines_cooldown', '5', [FCVAR_NUMERSONLY_UINT], 'Cooldown of thersold in seconds');
cvars.ChannelVar('flood_trigger', '5', [FCVAR_NUMERSONLY_UINT], 'How much time user should wait after flood spam was triggered in seconds');

hook.Add('PreOnValidMessage', 'AntiFlood', function(msg) {
	if (DBot.IsPM(msg))
		return;
	
	if (!msg.member)
		return;
	
	let member = msg.member;
	let cv = cvars.Channel(msg.channel);
	
	if (!cv.getVar('noflood').getBool())
		return;
	
	let cnt = msg.content.split('\n').length
	
	if (member.flood_trigger && member.flood_trigger > CurTime()) {
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('Stop flooding!');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		msg.delete();
		return true;
	}
	
	member.flood_newlines_thersold_last = member.flood_newlines_thersold_last || 0;
	
	if (member.flood_newlines_thersold_last < CurTime()) {
		member.flood_newlines_thersold_last = CurTime() + cv.getVar('flood_newlines_cooldown').getInt();
		member.flood_newlines_thersold = cnt;
	} else {
		member.flood_newlines_thersold += cnt;
	}
	
	if (cnt > cv.getVar('flood_newlines').getInt()) {
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('Message\ncontains\ntoo\nmany\nnew\nlines\nsad muzzle ;w;');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		msg.delete();
		return true;
	}
	
	if (member.flood_newlines_thersold > cv.getVar('flood_newlines_thersold').getInt()) {
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('You send too many messages with much new lines in so little time ;n;\nFlood ban is triggered ;w;');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		member.flood_trigger = CurTime() + cv.getVar('flood_trigger').getInt();
		
		msg.delete();
		return true;
	}
});
