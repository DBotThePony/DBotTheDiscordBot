
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const imageExt = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|webp)(\?|\/)?/i;
const imageExtExt = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|gif|webp)(\?|\/)?/i;
const expr = new RegExp('^https?://' + DBot.URLRootBare + '/(.*)');
const cover = new RegExp('\\.\\./', 'gi');
const cover2 = new RegExp('\\./', 'gi');
const insideBotFolder = new RegExp('^\\./resource/', '');

DBot.ExtraxtExt = function(url) {
	return url.match(imageExtExt)[1];
};

myGlobals.CommandHelper = {
	imageExt: imageExt,
	imageExtExt: imageExtExt,
	imCover: cover,
	imCover2: cover2,
	internalResource: insideBotFolder,
	urlExpression: expr,
	
	switchImageArgs: function(channel, args, defNum) {
		const url1 = CommandHelper.identifyURL(args[0]);
		const num1 = Number.from(args[0]);
		const url2 = CommandHelper.identifyURL(args[1]);
		const num2 = Number.from(args[1]);
		
		let num = defNum;
		
		if (num1 !== undefined)
			num = num1;
		else if (num2 !== undefined)
			num = num2;
		
		let url = null;
		
		if (url1 === null && url2 === null)
			url = CommandHelper.CombinedURL(undefined, channel);
		else if (url1 !== null)
			url = url1;
		else
			url = url2;
		
		return [num, url];
	},
	
	CombinedURL2: function(url, channel) {
		if (typeof(url) === 'object') {
			url = url.avatarURL;

			if (!url)
				return false;
		}

		url = url || DBot.LastURLImageInChannel2(channel);

		if (!url)
			return false;

		if (url.match(cover) || url.match(cover2) || url.match(/^\//))
			return false;

		if (!DBot.CheckURLImage2(url)) {
			let emojiMatch = url.match(DBot.emojiRegExpWeak);

			if (!emojiMatch)
				return false;
			else
				return DBot.FindEmojiURL(url);
		}

		return url;
	},
	
	CombinedURL: function(url, channel) {
		if (typeof(url) === 'object') {
			url = url.avatarURL;

			if (!url)
				return false;
		}

		url = url || DBot.LastURLImageInChannel(channel);

		if (!url)
			return false;

		if (url.match(cover) || url.match(cover2) || url.match(/^\//))
			return false;

		if (!DBot.CheckURLImage(url)) {
			let emojiMatch = url.match(DBot.emojiRegExpWeak);

			if (!emojiMatch)
				return false;
			else
				return DBot.FindEmojiURL(url);
		}

		return url;
	},
	
	identifyURL: function(url) {
		if (url === undefined || url === null) return null;
		if (typeof(url) === 'object') {
			url = url.avatarURL;
			if (!url) return null;
		}

		if (url.match(cover) || url.match(cover2) || url.match(/^\//))
			return null;

		if (!DBot.CheckURLImage(url)) {
			let emojiMatch = url.match(DBot.emojiRegExpWeak);

			if (!emojiMatch)
				return null;
			else
				return DBot.FindEmojiURL(url);
		}

		return url;
	}
};
