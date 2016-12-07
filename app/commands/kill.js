
const fs = require('fs');
const child_process = require('child_process');
const spawn = child_process.spawn;

MySQL.query('SELECT COUNT(*) AS `CNT` FROM `killicons`', function(err, data) {
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

const Font = 'TF2';
const FontSize = 28;

if (true)
	return;

module.exports = {
	name: 'kill',
	alias: ['killicon', 'killfeed'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		
	}
}

