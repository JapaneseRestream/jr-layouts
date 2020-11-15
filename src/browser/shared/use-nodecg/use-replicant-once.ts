import {useState} from "react";
import type {Replicant} from "ts-nodecg/browser";

import type {ReplicantMap} from "../../../nodecg/replicants";

export const useReplicantOnce = <
	TBundleName extends string,
	TRepMap extends ReplicantMap,
	TRepName extends keyof ReplicantMap,
	TSchema extends TRepMap[TRepName]
>(
	replicant: Replicant<TBundleName, TRepMap, TRepName, TSchema | undefined>,
): TSchema | null => {
	const [state, setState] = useState<TSchema | null>(null);
	void NodeCG.waitForReplicants(replicant as any).then(() => {
		if (replicant.value) {
			setState(replicant.value);
		}
	});
	return state;
};
