
Math.oldRandom = Math.oldRandom || Math.random;

Math.Random = function(min, max) {
	if (min === undefined)
		return Math.oldRandom();
	
	return Math.floor(Math.oldRandom() * (max - min)) + min;
};

Math.random = Math.Random;

Math.Clamp = function(val, min, max) {
	if (val > max) return max;
	if (val < min) return min;
	return val;
};

Math.clamp = Math.Clamp;
