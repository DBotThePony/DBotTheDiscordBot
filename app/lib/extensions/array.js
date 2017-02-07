
Array.Random = function(arr) {
	return arr[MathHelper.Random(0, arr.length - 1)];
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

Array.random = Array.Random;
Array.Concat = Array.concat;
Array.append = Array.Append;
Array.copy = Array.Copy;
