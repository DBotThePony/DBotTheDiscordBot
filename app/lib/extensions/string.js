

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

const crypto = require('crypto');

String.repeat = function(str, times) {
	let output = '';
	
	for (let i = 0; i < times; i++) {
		output += str;
	}
	
	return output;
};

String.hash = function(str) {
	return crypto.createHash('sha256').update(str).digest('hex');
};

String.hash5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
};

String.hash1 = function(str) {
	return crypto.createHash('sha1').update(str).digest('hex');
};

String.hash512 = function(str) {
	return crypto.createHash('sha512').update(str).digest('hex');
};

String.AppendSpaces = function(str, target) {
	return str.toString() + String.repeat(' ', target - str.toString().length);
};

String.Spaces = function(num) {
	let output = '';
	
	for (let i = 0; i < num; i++) {
		output += ' ';
	}
	
	return output;
};

String.appendSpaces = String.AppendSpaces;
String.spaces = String.Spaces;
