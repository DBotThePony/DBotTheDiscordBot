
DBot = {};
DBot.fs = require('fs');
DBot.WebRoot = 'D:/www/derpco/bot';
DBot.URLRoot = 'https://dbot.serealia.ca/bot';
DBot.DBot = '141004095145115648';

require('./util.js');

require('./modules/hook.js');
require('./modules/mysql.js');
require('./modules/misc.js');
require('./modules/tags.js');
require('./modules/commban.js');

require('./handler.js');
require('./commands.js');

DBot.fs.readdirSync('./lib/addons/').forEach(function(file) {
	var sp = file.split('.');
	if (!sp[1] || sp[1] != 'js')
		return;
	
	require('./addons/' + file);
});
