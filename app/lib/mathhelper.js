
let MathHelper = {
	Random: function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	},
	
	Clamp: function(val, min, max) {
		if (val > max) return max;
		if (val < min) return min;
		return val;
	}
};

module.exports = MathHelper;
