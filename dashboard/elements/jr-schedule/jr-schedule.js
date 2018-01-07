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
				this.game = newVal.game;
				this.runners = newVal.runners;
				this.category = newVal.category;
				this.commentator = newVal.commentator;
			});

			scheduleRep.on('change', newVal => {
				this.schedule = newVal;
			});

			targetChannelInfoRep.on('change', newVal => {
				this.targetChannelInfoTitle = newVal.title;
				this.targetChannelInfoGame = newVal.game;
			})
			ourChannelInfoRep.on('change', newVal => {
				this.ourChannelInfoTitle = newVal.title;
				this.ourChannelInfoGame = newVal.game;
			})
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
			this.editingGame = this.game;
			this.editingRunners = this.runners;
			this.editingCategory = this.category;
			this.editingCommentator = this.commentator;
			this.$.editDialog.open();
		}

		saveEdit() {
			nodecg.sendMessage('editRun', {
				game: this.editingGame,
				runners: this.editingRunners,
				category: this.editingCategory,
				commentator: this.editingCommentator
			}, () => {
				this.$.editDialog.close();
			})
		}

		unixTimeToString(unix) {
			return new Date(unix).toLocaleString();
		}

		calcCommentator(commentator) {
			return commentator ? commentator : '未設定'
		}
	}

	customElements.define(JrSchedule.is, JrSchedule);
})();
