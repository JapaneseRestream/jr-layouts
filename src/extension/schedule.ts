import _ from "lodash";

import type {CurrentRun} from "../nodecg/generated/currentRun";

import type {NodeCG} from "./nodecg";

export const setupSchedule = (nodecg: NodeCG) => {
	const spreadsheetRep = nodecg.Replicant("spreadsheet", {defaultValue: {}});
	const scheduleRep = nodecg.Replicant("schedule", {
		defaultValue: [],
	});
	const currentRunRep = nodecg.Replicant("currentRun", {
		defaultValue: null,
	});

	const setCurrentRun = (index: number) => {
		if (!scheduleRep.value) {
			return;
		}
		const newCurrentRun = scheduleRep.value[index];
		if (!newCurrentRun) {
			nodecg.log.error(
				"Invalid index to apply to current run replicant. The desired index does not exist",
			);
			return;
		}
		currentRunRep.value = _.clone(newCurrentRun);
	};

	spreadsheetRep.on("change", ({gamesList}) => {
		if (!gamesList) {
			return;
		}
		const newScheduleValue = gamesList.map<NonNullable<CurrentRun>>(
			(game, index) => {
				return {
					category: game.category,
					commentator: "",
					console: game.platform,
					game: game.title,
					index,
				};
			},
		);
		if (!_.isEqual(scheduleRep.value, newScheduleValue)) {
			scheduleRep.value = _.clone(newScheduleValue);
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
