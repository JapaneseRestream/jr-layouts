// @ts-check

const fs = require('fs');
const makeDir = require('make-dir');
const {compileFromFile} = require('json-schema-to-typescript');

const CWD = process.cwd();
const schemas = fs
	.readdirSync('./schemas')
	.filter(file => file.endsWith('.json'));

makeDir.sync('./types/schemas');

const compile = async (input, output, cwd = CWD) => {
	try {
		const ts = await compileFromFile(input, {
			cwd,
			declareExternallyReferenced: true,
			enableConstEnums: true,
		});
		await fs.promises.writeFile(output, ts);
		console.log(output);
	} catch (error) {
		console.error(error.stack);
	}
};

for (const schema of schemas) {
	compile(
		`./schemas/${schema}`,
		`./types/schemas/${schema.replace(/\.json$/i, '.ts')}`,
		'./schemas'
	);
}
