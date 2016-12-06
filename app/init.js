
DBot = {};
DBot.fs = require('fs');
DBot.WebRoot = 'D:/www/derpco/bot';
DBot.URLRootBare = 'dbot.serealia.ca/bot';
DBot.URLRoot = 'https://' + DBot.URLRootBare;
DBot.DBot = '141004095145115648';

require('./modules/util.js');

require('./modules/hook.js');
require('./modules/mysql.js');
require('./modules/cvars.js');
require('./generic.js');
require('./modules/tags.js');
require('./modules/commban.js');

require('./handler.js');
require('./commands.js');

require('./modules/confirm.js');

DBot.fs.readdirSync('./app/addons/').forEach(function(file) {
	var sp = file.split('.');
	if (!sp[1] || sp[1] != 'js')
		return;
	
	require('./addons/' + file);
});

DBot.START_STAMP = (new Date()).getTime() / 1000;
