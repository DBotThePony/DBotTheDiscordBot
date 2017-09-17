
//
// Copyright (C) 2017 DBot.
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

const ParseString = function(strIn: string) {
	const output: string[][] = []
	let currentLevel: string[] = []
	output.push(currentLevel)
	let currentString = ''
	let inSingle = false
	let inDouble = false
	let nextEscaped = false
	let prevChar = ''

	for (const val of strIn.trim()) {
		if (val == ' ' && !inSingle && !inDouble && !nextEscaped) {
			if (prevChar != ' ') {
				currentLevel.push(currentString)
				currentString = ''
				prevChar = val
			}
		} else if (val == '"') {
			if (inSingle || nextEscaped) {
				currentString += val
				nextEscaped = false
			} else if (inDouble) {
				inDouble = false
				currentLevel.push(currentString)
				currentString = ''
				prevChar = ''
			} else if (!inDouble && prevChar == ' ') {
				inDouble = true
				currentString = ''
				prevChar = ''
			} else { // ???
				currentString += val
			}
		} else if (val == '\'') {
			if (inDouble || nextEscaped) {
				currentString += val
				nextEscaped = false
			} else if (inSingle) {
				inSingle = false
				currentLevel.push(currentString)
				currentString = ''
				prevChar = ''
			} else if (!inSingle && prevChar == ' ') {
				inSingle = true
				currentString = ''
				prevChar = ''
			} else { // ???
				currentString += val
			}
		} else if (val == '\\') {
			nextEscaped = true
		} else if (val == '|' && !inDouble && !inSingle && !nextEscaped) {
			currentLevel = []
			output.push(currentLevel)
		} else {
			nextEscaped = false
			prevChar = val
			currentString += val
		}
	}

	if (currentString != '') {
		currentLevel.push(currentString)
	}

	return output
}

export {ParseString}
