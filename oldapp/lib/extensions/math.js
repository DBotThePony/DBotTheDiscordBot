

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
