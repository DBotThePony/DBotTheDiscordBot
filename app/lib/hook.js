
class Hook {
	constructor() {
		this.hooks = new Map();
		this.singles = new Map();
		this.run = this.call;
		this.Run = this.call;
		this.Add = this.add;
		this.Remove = this.remove;
		this.Delete = this.remove;
		this.delete = this.remove;
		this.GetTable = this.getTable;
	}
	
	add(event, id, func) {
		if (!event || !id || !func) return;
		if (!this.hooks.has(event))
			this.hooks.set(event, new Map());
		this.hooks.get(event).set(id, func);
	}
	
	
	single(event, func) {
		if (!event || !func) return;
		if (!this.singles.has(event))
			this.singles.set(event, []);
		this.singles.get(event).push(func);
	}
	
	remove(event, id) {
		if (!event || !id) return;
		if (!this.hooks.has(event)) return;
		this.hooks.get(event).delete(id);
	}
	
	call(event, A, B, C, D, E, F, G) {
		if (this.singles.has(event)) {
			for (const func of this.singles.get(event)) {
				func(A, B, C, D, E, F, G);
			}
			
			this.singles.delete(event);
		}
		
		if (this.hooks.has(event)) {
			for (const func of this.hooks.get(event).values()) {
				const reply = func(A, B, C, D, E, F, G);
				if (reply !== undefined) return reply;
			}
		}
	}
	
	getMap() {
		return this.hooks;
	}
	
	getTable() {
		let obj = {};
		
		for (const [key, val] of this.hooks) {
			obj[key] = obj[key] || {};
			for (const [key2, val2] of val) {
				obj[key][key2] = val;
			}
		}
		
		return obj;
	}
}

module.exports = Hook;
