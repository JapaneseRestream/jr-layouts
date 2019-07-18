import {useState} from 'react';
import {ReplicantBrowser} from 'ts-nodecg/helper/replicant';

import {ReplicantMap} from '../../../nodecg/replicants';

export const useReplicantOnce = <
	TRepName extends keyof ReplicantMap,
	TSchema extends ReplicantMap[TRepName]
>(
	replicant: ReplicantBrowser<TSchema, 'jr-layouts', TRepName>,
): TSchema | null => {
	const [state, setState] = useState<TSchema | null>(null);
	NodeCG.waitForReplicants(replicant).then(() => {
		if (replicant.value) {
			setState(replicant.value);
		}
	});
	return state;
};
