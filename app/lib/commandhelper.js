
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const URL = require('url');

const URLMessages = {};
const URLMessagesImages = {};
const URLMessagesImages2 = {};

const imageExt = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|webp)(\?|\/)?/i;
const imageExtExtended = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|gif|webp)(\?|\/)?/i;
const urlSelf = new RegExp('^https?://' + DBot.URLRootBare + '/(.*)');
const url = new RegExp('https?://([^ "\n]*)', 'g');
const urlStrong = new RegExp('^https?://([^ "\n]*)$');
const check = new RegExp('\\.?\\./', 'gi');
const internalResource = new RegExp('^\\./resource/', '');

DBot.ExtraxtExt = function(url) {
	return url.match(imageExtExtended)[1];
};

const CommandHelper = {
	imageExt: imageExt,
	imageExtExt: imageExtExtended,
	imageExtExtended: imageExtExtended,
	imCover: check,
	internalResource: internalResource,
	urlExpression: url,
	urlSelf: urlSelf,
	url: url,
	urlStrong: urlStrong,
	
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

		url = url || CommandHelper.lastImageURL2(channel);

		if (!url)
			return false;

		if (url.match(check) || url.match(/^\//))
			return false;

		if (!CommandHelper.checkURL2(url)) {
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

		url = url || CommandHelper.lastImageURL(channel);

		if (!url)
			return false;

		if (url.match(check) || url.match(/^\//))
			return false;

		if (!CommandHelper.checkURL(url)) {
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

		if (url.match(check) || url.match(/^\//))
			return null;

		if (!CommandHelper.checkURL(url)) {
			let emojiMatch = url.match(DBot.emojiRegExpWeak);

			if (!emojiMatch)
				return null;
			else
				return DBot.FindEmojiURL(url);
		}

		return url;
	},
	
	lastURL: function(channel) {
		return URLMessages[channel.id];
	},
	
	lastImageURL: function(channel) {
		return URLMessagesImages[channel.id];
	},
	
	lastImageURL2: function(channel) {
		return URLMessagesImages2[channel.id];
	},
	
	checkURL: function(url) {
		return url && url.match(urlStrong) && url.match(imageExt);
	},
	
	checkURL2: function(url) {
		return url && url.match(urlStrong) && url.match(imageExtExtended);
	}
};

CommandHelper.combinedURL = CommandHelper.CombinedURL;

const messageParseFunc = function(msg) {
	let cid = msg.channel.id;
	
	if (msg.attachments) {
		for (const val of msg.attachments.values()) {
			if (val.url && val.url.match(imageExt)) {
				URLMessages[cid] = val.url;
				URLMessagesImages[cid] = val.url;
			}
		}
	}
	
	const Message = msg.content;
	const get = Message.match(url);
	if (!get) return;
	
	for (const url of get) {
		if (url.match(imageExt)) URLMessagesImages[cid] = url;
		if (url.match(imageExtExtended)) URLMessagesImages2[cid] = url;
		URLMessages[cid] = url;
	}
};

hook.Add('OnMessage', 'CommandHelper', messageParseFunc);

hook.Add('OnMessageEdit', 'CommandHelper', function(omsg, nmsg) {
	messageParseFunc(nmsg);
});

myGlobals.CommandHelper = CommandHelper;
