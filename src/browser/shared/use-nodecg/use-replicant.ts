import isEqual from "lodash-es/isEqual";
import {useEffect, useMemo, useState} from "react";

import type {ReplicantMap as RM} from "../../../nodecg/replicants";

export const useReplicant = <TName extends keyof RM, TValue = RM[TName]>(
	replicantName: TName,
	getValue = (value: RM[TName]) => value as TValue,
) => {
	const replicant = useMemo(
		() => nodecg.Replicant(replicantName),
		[replicantName],
	);
	const [value, setValue] = useState<TValue>();

	useEffect(() => {
		const changeHandler = (newReplicantValue: RM[TName]) => {
			const newValue = getValue(newReplicantValue);
			setValue((oldValue) => {
				if (oldValue !== newValue || !isEqual(oldValue, newValue)) {
					return newValue;
				}
				return oldValue;
			});
		};
		replicant.on("change", changeHandler);
		return () => {
			replicant.removeListener("change", changeHandler);
		};
	}, [replicant, getValue]);

	return [
		value,
		(
			newValue: RM[TName] | ((oldValue: RM[TName] | undefined) => RM[TName]),
		) => {
			if (typeof newValue === "function") {
				replicant.value = newValue(replicant.value);
			} else {
				replicant.value = newValue;
			}
		},
	] as const;
};
