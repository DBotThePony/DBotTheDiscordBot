
//
// Copyright (C) 2017 DBot
//
// Licensed under the Apache License, Version 2.0 (the "License")
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

class Hook {
	hooks = new Map<string, Map<string, () => any>>()
	singles = new Map<string, (() => any)[]>()

	add(event: string, id: string, func: () => any) {
		if (!event || !id || !func) return
		if (this.hooks.has(event)) {
			(<any> this.hooks.get(event)).set(id, func)
		} else {
			const newMap = new Map()
			this.hooks.set(event, newMap)
			newMap.set(id, func)
		}
	}


	single(event: string, func: () => any) {
		if (!event || !func) return
		if (!this.singles.has(event)) {
			const arr: (() => any)[] = []
			this.singles.set(event, arr)
		} else {
			(<any> this.singles.get(event)).push(func)
		}
	}

	remove(event: string, id: string) {
		if (!event || !id) return
		if (this.hooks.has(event)) {
			(<any> this.hooks.get(event)).delete(id)
		}
	}

	call(event: string, ...callArgs: any[]) {
		if (this.singles.has(event)) {
			for (const func of (<any> this.singles.get(event))) {
				func.apply(null, callArgs)
			}

			this.singles.delete(event)
		}

		if (this.hooks.has(event)) {
			for (const func of (<any> this.hooks.get(event)).values()) {
				const reply = func.apply(null, callArgs)
				if (reply !== undefined) {
					return reply
				}
			}
		}
	}

	run(...args: any[]) {
		this.call.apply(this, args)
	}

	Call(...args: any[]) {
		this.call.apply(this, args)
	}

	Run(...args: any[]) {
		this.call.apply(this, args)
	}

	getMap() {
		return this.hooks
	}

	getTable() {
		const obj: any = {}

		for (const [key, val] of this.hooks) {
			obj[key] = obj[key] || {}
			for (const [key2, val2] of val) {
				obj[key][key2] = val2
			}
		}

		return obj
	}
}

export {Hook}
