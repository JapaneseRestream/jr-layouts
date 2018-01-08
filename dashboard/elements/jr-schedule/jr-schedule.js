/* global Polymer */

(function() {
	const currentRunRep = nodecg.Replicant('currentRun');
	const scheduleRep = nodecg.Replicant('schedule');
	const targetChannelInfoRep = nodecg.Replicant('targetChannelInfo');
	const ourChannelInfoRep = nodecg.Replicant('ourChannelInfo');

	class JrSchedule extends Polymer.Element {
		static get is() {
			return 'jr-schedule';
		}

		ready() {
			super.ready();

			currentRunRep.on('change', newVal => {
				this.run = { ...newVal };
			});

			scheduleRep.on('change', newVal => {
				this.schedule = newVal;
			});

			targetChannelInfoRep.on('change', newVal => {
				this.targetChannelInfoTitle = newVal.title;
				this.targetChannelInfoGame = newVal.game;
			});
			ourChannelInfoRep.on('change', newVal => {
				this.ourChannelInfoTitle = newVal.title;
				this.ourChannelInfoGame = newVal.game;
			});
		}

		previousRun() {
			nodecg.sendMessage('previousRun');
		}

		nextRun() {
			nodecg.sendMessage('nextRun');
		}

		setCurrentRunByIndex(e) {
			const index = e.model.item.index;
			nodecg.sendMessage('specificRun', index);
		}

		loadEdit() {
			this.editingRun = { ...this.run };
			this.$.editDialog.open();
		}

		saveEdit() {
			nodecg.sendMessage('editRun', this.editingRun, () => {
				this.$.editDialog.close();
			});
		}

		unixTimeToString(unix) {
			return new Date(unix).toLocaleString();
		}
	}
	customElements.define(JrSchedule.is, JrSchedule);
})();
