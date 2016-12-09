
DBot = {};
DBot.fs = require('fs');
DBot.WebRoot = 'D:/www/derpco/bot';
DBot.URLRootBare = 'dbot.serealia.ca/bot';
DBot.URLRoot = 'https://' + DBot.URLRootBare;
DBot.DBot = '141004095145115648';

require('./lib/util.js');
require('./lib/hook.js');
require('./lib/sql_helpers.js');
require('./lib/sql.js');
require('./lib/imagick.js');

require('./lib/cvars.js');
require('./generic.js');
require('./lib/tags.js');
require('./lib/commban.js');

require('./handler.js');
require('./commands.js');

require('./lib/confirm.js');

DBot.fs.readdirSync('./app/modules/').forEach(function(file) {
	var sp = file.split('.');
	if (!sp[1] || sp[1] != 'js')
		return;
	
	require('./modules/' + file);
});

DBot.START_STAMP = (new Date()).getTime() / 1000;
