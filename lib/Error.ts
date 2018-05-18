
//
// Copyright (C) 2017-2018 DBot.
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

const constructMessage = (errorMessage: string, fieldName?: string, expected?: any, got?: any) => {
	if (!fieldName) {
		return errorMessage
	}

	if (expected == undefined) {
		return errorMessage + '\n\t(field ' + fieldName + ')'
	}

	return errorMessage + ' (field ' + fieldName + ')\n\tExpected: ' + expected + '\n\tGot: ' + got
}

class InvalidStateException extends Error {
	constructor(public errorFromState: string = 'Invalid internal state', public fieldName?: string, public expected?: any, public got?: any) {
		super(constructMessage(errorFromState, fieldName, expected, got))
	}

	name = 'InvalidStateException'
}

export {InvalidStateException}
