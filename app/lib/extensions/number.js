

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

const mathRegStrict = /^-?[0-9]+$/;
const mathReg = /^-?[0-9]+/;

Number.from = function(arg) {
	let num;
	
	if (typeof arg === 'string') {
		if (arg.match(mathRegStrict)) {
			let tryNum = parseInt(arg);
		
			if (tryNum === tryNum) { // NaN ???
				num = tryNum;
			}
		}
	} else if (typeof arg === 'number') {
		return arg;
	}
	
	return num;
};

Number.weakFrom = function(arg) {
	let num;
	
	if (typeof arg === 'string') {
		let match = arg.match(mathReg);
		if (match) {
			let tryNum = parseInt(match[0]);
		
			if (tryNum === tryNum) { // NaN ???
				num = tryNum;
			}
		}
	} else if (typeof arg === 'number') {
		return arg;
	}
	
	return num;
};