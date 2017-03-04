
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

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
