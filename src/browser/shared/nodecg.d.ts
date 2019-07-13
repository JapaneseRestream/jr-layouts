import {CreateNodecgInstance, CreateNodecgConstructor} from 'ts-nodecg/browser';
import {BundleConfig} from '../../nodecg/bundle-config';
import {ReplicantMap} from '../../nodecg/replicants';
import {MessageMap} from '../../nodecg/messages';

declare global {
	const nodecg: CreateNodecgInstance<
		BundleConfig,
		'jr-layouts',
		ReplicantMap,
		MessageMap
	>;
	const NodeCG: CreateNodecgConstructor<
		BundleConfig,
		'jr-layouts',
		ReplicantMap,
		MessageMap
	>;
}
