import {useEffect, useState} from 'react';
import _ from 'lodash';
import {ReplicantBrowser} from 'nodecg/types/browser';

/**
 * Subscribe to a replicant, returns tuple of the replicant value and `setValue` function.
 * The component using this function gets re-rendered when the value is updated.
 * The `setValue` function can be used to update replicant value.
 * @param replicant Replicant object to subscribe to
 * @param initialValue Initial value to pass to `useState` function
 */
export const useReplicant = <T, U>(
	replicant: ReplicantBrowser<T>,
	initialValue: U,
): [T | U, (newValue: T) => void] => {
	const [value, updateValue] = useState<T | U>(initialValue);

	const changeHandler = (newValue: T): void => {
		updateValue((oldValue) => {
			if (newValue !== oldValue) {
				return newValue;
			}
			if (_.isEqual(oldValue, newValue)) {
				return oldValue;
			}
			return _.clone(newValue);
		});
	};

	useEffect(() => {
		replicant.on('change', changeHandler);
		return () => {
			replicant.removeListener('change', changeHandler);
		};
	}, [replicant]);

	return [
		value,
		(newValue) => {
			replicant.value = newValue;
		},
	];
};
