
/* global Math */

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

Array.Trim = function(arr) {
	let newArray = [];
	
	arr.forEach(function(item, i) {
		if (item !== '') {
			newArray.push(item);
		};
	});
	
	return newArray;
};

Array.Random = function(arr) {
	return arr[Math.Random(0, arr.length - 1)];
};

Array.concat = function(obj, sep) {
	sep = sep || '';
	
	if (Array.isArray(obj))
		return obj.join(sep);
	else {
		let first = true;
		let out = '';

		for (let i in obj) {
			let item = obj[i];

			if (first) {
				first = false;
				out = item;
			} else {
				out += sep + item;
			}
		}

		return out;
	}
};

Array.Append = function(Dest, Source) {
	for (let i in Source) {
		Dest.push(Source[i]);
	}
	
	return Dest;
};

Array.Copy = function(Source) {
	let Dest = [];
	
	for (let i in Source) {
		Dest.push(Source[i]);
	}
	
	return Dest;
};

Array.MapDiff = function(newMap, oldMap) {
	const added = [];
	const removed = [];
	
	for (const key of oldMap.keys()) {
		if (!newMap.has(key)) {
			removed.push(oldMap.get(key));
		}
	}
	
	for (const key of newMap.keys()) {
		if (!oldMap.has(key)) {
			added.push(newMap.get(key));
		}
	}
	
	return [added, removed];
};

Array.Diff = function(newArray, oldArray) {
	const added = [];
	const removed = [];
	
	for (const c of newArray) {
		if (!oldArray.includes(c)) {
			added.push(c);
		}
	}
	
	for (const c of oldArray) {
		if (!newArray.includes(c)) {
			removed.push(c);
		}
	}
	
	return [added, removed];
};

Array.random = Array.Random;
Array.Concat = Array.concat;
Array.append = Array.Append;
Array.copy = Array.Copy;
