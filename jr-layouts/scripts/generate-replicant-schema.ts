/* eslint-disable no-sync,no-console */

import path from 'path';
import * as TJS from 'typescript-json-schema';
import writeJson from 'write-json-file';
import globby from 'globby';
import del from 'del';
import _ from 'lodash';

const outputDir = path.resolve(__dirname, `../schemas`);

del.sync(outputDir);

const settings: TJS.PartialArgs = {
	ref: true,
	aliasRef: false,
	titles: true,
	noExtraProps: false,
	required: true,
	strictNullChecks: true,
};

const replicantFiles = globby.sync('../src/replicants/*.ts', {
	cwd: __dirname,
});

const replicants = replicantFiles
	.map((file) => path.basename(file, '.ts'))
	.filter((name) => name !== 'lib');

const program = TJS.getProgramFromFiles(
	replicantFiles.map((file) => path.resolve(__dirname, file)),
);

for (const replicant of replicants) {
	const schema = TJS.generateSchema(
		program,
		_.upperFirst(_.camelCase(replicant)),
		settings,
	);
	if (!schema) {
		console.error(`Schema is empty for replicant ${replicant}`);
		process.exitCode = 1;
	}
	const outputPath = path.resolve(outputDir, `${replicant}.json`);
	writeJson.sync(outputPath, schema);
}
