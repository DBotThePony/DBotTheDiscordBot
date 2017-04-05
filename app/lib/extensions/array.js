
/* global Math */

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
