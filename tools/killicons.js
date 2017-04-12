
'use strict';

process.env['PATH'] = '../bin;' + process.env['PATH'];

const json3 = require('json3');
const fs = require('fs');
const child_process = require('child_process');
const spawn = child_process.spawn;
const basePath = '../resource/killicons/';
const outputFile = '../resource/killicons_data.json';

console.log('Reading directory');

const files = fs.readdirSync(basePath);
const args = [];

for (const file of files) {
	args.push(basePath + file);
}

let output = '';
const identify = spawn('identify', args);

identify.stderr.pipe(process.stderr);
identify.stdout.on('data', (bin) => {
	output += bin.toString();
});

console.log('Identifying');

identify.on('close', (code) => {
	if (code !== 0) {
		console.error('identify exit with non zero code');
		process.exit(code);
	}

	const split = output.replace(/\r/g, '').split('\n');
	const outputData = {};

	for (const outputString of split) {
		const infos = outputString.split(' ');
		if (!infos[1]) continue;
		const sizes = infos[2].split('x');

		const name = infos[0].substr(basePath.length);
		const wepClass = name.substr(0, name.length - 4);
		const width = Number(sizes[0]);
		const height = Number(sizes[1]);

		console.log(wepClass, ' => ', width + 'x' + height, 'pixels');

		outputData[wepClass] = {
			filename: name,
			width: width,
			height: height
		};
	}

	fs.writeFileSync(outputFile, json3.stringify(outputData));
});
