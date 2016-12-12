
const fs = require('fs');
const child_process = require('child_process');
const spawn = child_process.spawn;

MySQL.query('SELECT COUNT(*) AS CNT FROM killicons', function(err, data) {
	if (data && data[0] && data[0].CNT != 0)
		return;
	
	fs.readdir('./resource/killicons', function(err, files) {
		let names = ['NAME', 'FILENAME', 'CLASSNAME', 'WIDTH', 'HEIGHT'];
		for (let file of files) {
			let Class = file.substr(0, file.length - 4);
			let name = Class.replace(/_/gi, ' ');
			
			let magik = spawn('identify', ['./resource/killicons/' + file]);
			
			let output = '';
			
			magik.stderr.on('data', function(data) {
				console.error(data.toString());
			});
			
			magik.stdout.on('data', function(data) {
				output += data.toString();
			});
			
			magik.on('close', function(code) {
				let parse = output.split(' ');
				
				let fileName = parse[0];
				let fileType = parse[1];
				let fileSizes = parse[2];
				
				let fileSizesS = fileSizes.split('x');
				let width = fileSizesS[0];
				let height = fileSizesS[1];
				let aspectRatio = height / width;
				let aspectRatio2 = width / height;
				
				MySQL.query(sql.Insert('killicons', names, [name, file, Class, width, height]));
			});
		}
	});
});

Util.mkdir(DBot.WebRoot + '/killfeed');

const Font = 'TF2';
const FontSize = 42;
const FontSpacing = .5;
const bg = 'rgb(241,233,203)';
const red = 'rgb(163,87,74)';
const blu = 'rgb(85,124,131)';

hook.Add('PrecacheFonts', 'KillIcon', function() {
	IMagick.PrecacheFont(Font);
});

let generateFunc = function(col1, col2) {
	return function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('No user', 'kill', args, 1);
		
		let username = args[0];
		
		if (typeof username == 'object')
			username = username.username;
		
		if (!args[1])
			return DBot.CommandError('No weapon name', 'kill', args, 1);
		
		let weapon = args[1].toLowerCase();
		
		let username2 = args[2];
		
		if (typeof username2 == 'object')
			username2 = username2.username;
		
		let sha = DBot.HashString(username + ' ' + weapon + ' ' + username2);
		let fpath = DBot.WebRoot + '/killfeed/' + sha + '.png';
		let fpathU = DBot.URLRoot + '/killfeed/' + sha + '.png';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.reply(fpathU);
				return;
			}
			
			MySQL.query('SELECT * FROM killicons WHERE "CLASSNAME" = ' + Util.escape(weapon) + ' OR "NAME" = ' + Util.escape(weapon) + ' OR "NAME" LIKE ' + Util.escape('%' + weapon + '%') + ' OR "CLASSNAME" LIKE ' + Util.escape('%' + weapon + '%'), function(err, data) {
				if (err) {
					msg.reply('<internal pony error>');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such weapon');
					return;
				}
				
				let filename = data[0].FILENAME;
				
				let width = Number(data[0].WIDTH);
				let iheight = Number(data[0].HEIGHT);
				let height = 70;
				let calcWidthFirst = IMagick.GetTextSize(username, Font, FontSize)[0];
				let calcWidthLast = 0;
				
				if (username2)
					calcWidthLast = IMagick.GetTextSize(username2, Font, FontSize)[0] + 25;
				
				let totalWidth = calcWidthFirst + width + calcWidthLast + 30;
				
				if (!username2)
					totalWidth += 40;
				
				let magikArgs = [
					'-size', totalWidth + 'x' + height,
					'canvas:' + bg,
					'-font', Font,
					'-pointsize', FontSize,
					'-fill', col1,
					'-weight', '700',
				];
				
				if (username2) {
					magikArgs.push('-draw', 'text 40,50 ' + Util.escape(username));
					magikArgs.push('-draw', 'image over ' + (calcWidthFirst - 10 + width / 2) + ',' + (height / 2 - iheight / 2) + ' 0,0 "./resource/killicons/' + data[0].FILENAME + '"');
					magikArgs.push('-fill', col2, '-draw', 'text ' + (35 + calcWidthFirst + width) + ',50 ' + Util.escape(username2));
				} else {
					magikArgs.push('-draw', 'image over 30,' + (height / 2 - iheight / 2) + ' 0,0 "./resource/killicons/' + data[0].FILENAME + '"');
					magikArgs.push('-draw', 'text ' + (60 + width) +',50 ' + Util.escape(username));
				}
				
				magikArgs.push(fpath);
				
				let magik = spawn('convert', magikArgs);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code != 0) {
						msg.reply('<internal pony error>');
						return;
					}
					
					msg.reply(fpathU);
				});
			});
		});
	};
}

module.exports = {
	name: 'kill',
	alias: ['killicon', 'killfeed'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text',
	allowUserArgument: true,
	
	func: generateFunc(red, blu),
}

DBot.RegisterCommand({
	name: 'rkill',
	alias: ['rkillicon', 'rkillfeed', 'killiconr', 'killfeedr', 'killr', 'kill_r'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text. Instead of RED / BLU uses BLU / RED',
	allowUserArgument: true,
	
	func: generateFunc(blu, red),
});

DBot.RegisterCommand({
	name: 'tkill',
	alias: ['tkillicon', 'tkillfeed', 'killicont', 'killfeedt', 'killt', 'kill_t'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text. TEAM KILLER!',
	allowUserArgument: true,
	
	func: generateFunc(red, red),
});

DBot.RegisterCommand({
	name: 'rtkill',
	alias: ['rtkillicon', 'rtkillfeed', 'rkillicont', 'rkillfeedt', 'killrt', 'kill_rt', 'trkillicon', 'trkillfeed', 'rkillicont', 'rkillfeedt', 'killtr', 'kill_tr'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text. BLU TEAM KILLER!',
	allowUserArgument: true,
	
	func: generateFunc(blu, blu),
});
