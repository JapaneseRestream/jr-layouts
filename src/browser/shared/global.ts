import type {
	CreateNodecgInstance,
	CreateNodecgConstructor,
} from "ts-nodecg/browser";

import type {BundleConfig} from "../../nodecg/bundle-config";
import type {MessageMap} from "../../nodecg/messages";
import type {ReplicantMap} from "../../nodecg/replicants";

declare global {
	const nodecg: CreateNodecgInstance<
		"jr-layouts",
		BundleConfig,
		ReplicantMap,
		MessageMap
	>;
	const NodeCG: CreateNodecgConstructor<
		"jr-layouts",
		BundleConfig,
		ReplicantMap,
		MessageMap
	>;
}
