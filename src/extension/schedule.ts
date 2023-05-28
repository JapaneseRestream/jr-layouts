import type {CurrentRun} from "../nodecg/generated/current-run";

import type {NodeCG} from "./nodecg";

export const setupSchedule = async (nodecg: NodeCG) => {
	const {default: clone} = await import("lodash-es/clone.js");
	const {default: isEqual} = await import("lodash-es/isEqual.js");

	const spreadsheetRep = nodecg.Replicant("spreadsheet", {defaultValue: []});
	const scheduleRep = nodecg.Replicant("schedule", {
		defaultValue: [],
	});
	const currentRunRep = nodecg.Replicant("current-run");

	const setCurrentRun = (index: number) => {
		const newCurrentRun = scheduleRep.value[index];
		if (!newCurrentRun) {
			nodecg.log.error(
				"Invalid index to apply to current run replicant. The desired index does not exist",
			);
			return;
		}
		currentRunRep.value = clone(newCurrentRun);
	};

	spreadsheetRep.on("change", (gamesList) => {
		const newScheduleValue = gamesList.map<NonNullable<CurrentRun>>(
			(game, index) => {
				return {
					category: game.category,
					console: game.platform,
					game: game.title,
					index,
				};
			},
		);
		if (!isEqual(scheduleRep.value, newScheduleValue)) {
			scheduleRep.value = clone(newScheduleValue);
		}
		if (!currentRunRep.value) {
			setCurrentRun(0);
		} else if (currentRunRep.value.index >= gamesList.length) {
			setCurrentRun(0);
		}
	});

	nodecg.listenFor("previousRun", () => {
		if (currentRunRep.value) {
			setCurrentRun(currentRunRep.value.index - 1);
		} else {
			setCurrentRun(0);
		}
	});

	nodecg.listenFor("nextRun", () => {
		if (currentRunRep.value) {
			setCurrentRun(currentRunRep.value.index + 1);
		} else {
			setCurrentRun(0);
		}
	});
};
