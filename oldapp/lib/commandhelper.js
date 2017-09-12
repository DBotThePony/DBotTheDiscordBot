

// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

'use strict';

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const URL = require('url');
const unirest = require('unirest');
const fs = require('fs');
const emoji = require('./emoji.js');

Util.mkdir(DBot.WebRoot + '/img_cache');

const imageExt = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|webp)(\?|\/|$)?/i;
const imageExtExtended = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|gif|webp)(\?|\/)?/i;
const urlSelf = new RegExp('^https?://' + DBot.URLRootBare + '/(.*)');
const url = new RegExp('https?://([^ "\',\n]*)', 'gi');
const urlStrong = new RegExp('^https?://([^ "\',\n]*)$');
const check = new RegExp('\\.\\./', 'gi');
const internalResource = new RegExp('^\\./resource/', '');

DBot.ExtraxtExt = function(url) {
	return url.match(imageExtExtended)[1];
};

myGlobals.CommandHelper = myGlobals.CommandHelper || {};
const CommandHelper = myGlobals.CommandHelper;


CommandHelper.imageExt = imageExt,
CommandHelper.imageExtExt = imageExtExtended,
CommandHelper.imageExtExtended = imageExtExtended,
CommandHelper.imCover = check,
CommandHelper.internalResource = internalResource,
CommandHelper.urlExpression = url,
CommandHelper.urlSelf = urlSelf,
CommandHelper.url = url,
CommandHelper.urlStrong = urlStrong,

CommandHelper.URLMessages = CommandHelper.URLMessages || new Map(),
CommandHelper.URLMessagesImages = CommandHelper.URLMessagesImages || new Map(),
CommandHelper.URLMessagesImages2 = CommandHelper.URLMessagesImages2 || new Map(),

CommandHelper.switchImageArgs = function(channel, args, defNum) {
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
};

CommandHelper.CombinedURL2 = function(url, channel) {
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
		let emojiMatch = url.match(emoji.regExpWeak);

		if (!emojiMatch)
			return false;
		else
			return emoji.findURL(url);
	}

	return url;
};

CommandHelper.CombinedURL = function(url, channel) {
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
		let emojiMatch = url.match(emoji.regExpWeak);

		if (!emojiMatch)
			return false;
		else
			return emoji.findURL(url);
	}

	return url;
};

CommandHelper.identifyURL = function(url) {
	if (url === undefined || url === null) return null;
	if (typeof(url) === 'object') {
		url = url.avatarURL;
		if (!url) return null;
	}

	if (url.match(check) || url.match(/^\//))
		return null;

	if (!CommandHelper.checkURL(url)) {
		let emojiMatch = url.match(emoji.regExpWeak);

		if (!emojiMatch)
			return null;
		else
			return emoji.findURL(url);
	}

	return url;
};

CommandHelper.lastURL = function(channel) {
	return CommandHelper.URLMessages.get(channel.id);
};

CommandHelper.lastImageURL = function(channel) {
	return CommandHelper.URLMessagesImages.get(channel.id);
};

CommandHelper.lastImageURL2 = function(channel) {
	return CommandHelper.URLMessagesImages2.get(channel.id);
};

CommandHelper.checkURL = function(url) {
	return url && url.match(urlStrong) && url.match(imageExt);
};

CommandHelper.checkURL2 = function(url) {
	return url && url.match(urlStrong) && url.match(imageExtExtended);
};

CommandHelper.loadImage = function(url, callback, callbackError) {
	const hash = String.hash(url);
	const matchExt = url.match(imageExtExtended);
	const match = url.match(urlSelf);

	let fPath = DBot.WebRoot + '/img_cache/' + hash + '.' + matchExt[1];

	if (url.match(internalResource) && !url.match(check)) {
		callback(url);
		return;
	}

	if (match && !url.match(check)) {
		fPath = DBot.WebRoot + '/' + match[1];
	}

	fs.stat(fPath, function(err, stat) {
		if (stat && stat.isFile()) {
			callback(fPath, matchExt[1]);
		} else {
			unirest.get(url)
			.encoding(null)
			.end(function(result) {
				const body = result.raw_body;

				if (!body) {
					if (callbackError) {
						try {
							callbackError(result);
						} catch(err) {
							console.error(err);
						}
					}

					return;
				}

				fs.writeFile(fPath, body, {flag: 'w'}, function(err) {
					if (err) return;
					callback(fPath, matchExt[1]);
				});
			});
		}
	});
};

CommandHelper.messageParseFunc = function(msg) {
	const cid = msg.channel.id;

	if (msg.attachments) {
		for (const val of msg.attachments.values()) {
			if (val.url && val.url.match(imageExt)) {
				CommandHelper.URLMessages.set(cid, val.url);
				CommandHelper.URLMessagesImages.set(cid, val.url);
			}
		}
	}

	const get = msg.content.match(url);
	if (!get) return;

	for (const urlStr of get) {
		if (urlStr.match(imageExt))
			CommandHelper.URLMessagesImages.set(cid, urlStr);

		if (urlStr.match(imageExtExtended))
			CommandHelper.URLMessagesImages2.set(cid, urlStr);

		CommandHelper.URLMessages.set(cid, urlStr);
	}
};

CommandHelper.combinedURL = CommandHelper.CombinedURL;
hook.Add('OnRawMessage', 'CommandHelper', CommandHelper.messageParseFunc);
hook.Add('OnMessageEdit', 'CommandHelper', (omsg, nmsg) => CommandHelper.messageParseFunc(nmsg));
