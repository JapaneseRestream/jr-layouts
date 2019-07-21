import {CreateNodecgInstance, CreateNodecgConstructor} from 'ts-nodecg/browser';

import {BundleConfig} from '../../nodecg/bundle-config';
import {ReplicantMap} from '../../nodecg/replicants';
import {MessageMap} from '../../nodecg/messages';

export interface FontFaceSet {
	status: 'loading' | 'loaded';
	ready: Promise<FontFaceSet>;
	check(font: string, text?: string): boolean;
	load(font: string, text?: string): Promise<void>;
}

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
	interface Document {
		fonts: FontFaceSet;
	}
}
