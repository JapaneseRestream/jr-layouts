import {CreateNodecgInstance} from 'ts-nodecg/server';

import {BundleConfig} from '../nodecg/bundle-config';
import {ReplicantMap} from '../nodecg/replicants';
import {MessageMap} from '../nodecg/messages';

export type NodeCG = CreateNodecgInstance<
	'jr-layouts',
	BundleConfig,
	ReplicantMap,
	MessageMap
>;
