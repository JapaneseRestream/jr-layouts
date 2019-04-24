/* eslint-disable no-sync,no-console,no-loop-func */

import {fork} from 'child_process';
import path from 'path';
import {mkdirSync} from 'fs';
import globby from 'globby';
import del from 'del';
import _ from 'lodash';

process.chdir(path.resolve(__dirname, '..'));

const tjsBin = './node_modules/.bin/typescript-json-schema';

interface RunTjsOptions {
	out: string;
	src: string;
	typeName: string;
}

const runTjs = (options: RunTjsOptions) => {
	return new Promise<void>((resolve, reject) => {
		const tjsProcess = fork(tjsBin, [
			'--noExtraProps',
			'--required',
			'--strictNullChecks',
			'--out',
			options.out,
			options.src,
			options.typeName,
		]);
		let handled = false;
		tjsProcess.on('exit', (statusCode) => {
			if (handled) {
				return;
			}
			handled = true;
			if (statusCode !== 0) {
				reject(
					new Error(
						`typescript-json-schema process exited with status ${statusCode}`,
					),
				);
				return;
			}
			resolve();
		});
		tjsProcess.on('error', (error) => {
			if (handled) {
				return;
			}
			handled = true;
			reject(error);
		});
	});
};

const generateReplicantSchema = () => {
	const outDir = './schemas';

	const files = globby
		.sync('./src/replicants/*.ts')
		.filter((file) => !file.endsWith('lib.ts'));

	del.sync(outDir);
	mkdirSync(outDir);

	for (const file of files) {
		const schemaName = path.basename(file, '.ts');
		const out = path.resolve(outDir, `${schemaName}.json`);
		runTjs({
			out,
			src: file,
			typeName: _.upperFirst(_.camelCase(schemaName)),
		})
			.then(() => {
				console.log(out);
			})
			.catch(() => {
				process.exitCode = 1;
			});
	}
};

const generateConfigSchema = () => {
	const out = path.resolve('./configschema.json');

	del.sync(out);

	runTjs({
		out,
		src: './src/bundle-config.ts',
		typeName: 'BundleConfig',
	})
		.then(() => {
			console.log(out);
		})
		.catch(() => {
			process.exitCode = 1;
		});
};

generateReplicantSchema();
generateConfigSchema();
