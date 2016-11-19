
DBot = {};
DBot.fs = require('fs');
DBot.WebRoot = 'D:/www/derpco/bot';
DBot.URLRoot = 'https://dbot.serealia.ca/bot';

require('./util.js');

require('./modules/hook.js');
require('./modules/mysql.js');
require('./modules/misc.js');
require('./modules/tags.js');

require('./handler.js');
require('./commands.js');

