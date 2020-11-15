import type {CreateNodecgInstance} from "ts-nodecg/server";

import type {BundleConfig} from "../nodecg/bundle-config";
import type {ReplicantMap} from "../nodecg/replicants";
import type {MessageMap} from "../nodecg/messages";

export type NodeCG = CreateNodecgInstance<
	"jr-layouts",
	BundleConfig,
	ReplicantMap,
	MessageMap
>;
