import {execFileSync} from 'child_process';
import {symlinkSync} from 'fs';
import path from 'path';
import del from 'del';

const resolvePath = (...paths: string[]) => path.resolve(__dirname, ...paths);

const bowerPath = resolvePath('../node_modules/.bin/bower');
const nodecgPath = resolvePath('../node_modules/nodecg');

const linkToNodecg = (target: string, source: string) => {
	const targetAbsolutePath = resolvePath(nodecgPath, target);
	del.sync(targetAbsolutePath);
	symlinkSync(source, targetAbsolutePath, 'dir');
};

execFileSync(bowerPath, ['install', '--production', '--allow-root'], {
	cwd: nodecgPath,
});

linkToNodecg('bundles/jr-layouts', '../../../jr-layouts');
linkToNodecg('cfg', '../../cfg');
linkToNodecg('db', '../../db');
