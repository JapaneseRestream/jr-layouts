import {useState} from 'react';
import {ReplicantBrowser} from 'nodecg/types/browser';

export const useReplicantOnce = <T>(
	replicant: ReplicantBrowser<T>,
	initialValue: T,
): T => {
	const [state, setState] = useState(initialValue);
	NodeCG.waitForReplicants(replicant).then(() => {
		if (replicant.value) {
			setState(replicant.value);
		}
	});
	return state;
};
