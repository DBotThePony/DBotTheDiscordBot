

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

const myGlobals = require('../../globals.js');

console.__dbot_oldError = console.__dbot_oldError || console.error;
console.__dbot_oldLog = console.__dbot_oldLog || console.log;

console.error = function() {
	if (myGlobals.hook) {
		myGlobals.hook.Run('OnConsolePrint', arguments)
		myGlobals.hook.Run('OnError', arguments)
	}
	
	console.__dbot_oldError.apply(this, arguments);
};

console.log = function() {
	if (myGlobals.hook) {
		myGlobals.hook.Run('OnConsolePrint', arguments)
		myGlobals.hook.Run('OnConsoleMessage', arguments)
		myGlobals.hook.Run('OnPrint', arguments)
	}
	
	console.__dbot_oldLog.apply(this, arguments);
};

console.errHandler = function(err) {
	if (err !== null)
		console.error(err);
};

console.callback = function() {
	const trace = (new Error()).stack;
	
	return function(err) {
		if (err === null) return;
		console.error(err.trace || err);
		console.error('---------');
		console.error(trace);
	};
};

console.errorHandler = console.errHandler;
console.nerr = console.errHandler;
console.nerror = console.errHandler;
console.merr = console.errHandler;
