(function(){
	const currentRunRep = nodecg.Replicant('currentRun');
	const scheduleRep = nodecg.Replicant('schedule');

	class JrUpcoming extends Polymer.Element {
		static get is() {
			return 'jr-upcoming';
		}

		static get properties() {
			return {
				'run-number': {
					type: Number
				}
			}
		}

		ready() {
			super.ready();

			currentRunRep.on('change', newVal => {
				this.currentIndex = newVal.index;
				this.calcUpcomingRuns();
			});

			scheduleRep.on('change', newVal => {
				this.schedule = newVal;
				this.calcUpcomingRuns();
			})
		}

		calcUpcomingRuns() {
			if (!this.currentIndex || !this.schedule) {
				return;
			}
			this.upcomingRuns = this.schedule.slice(this.currentIndex, this.currentIndex + this['run-number'])
		}
	}
	customElements.define(JrUpcoming.is, JrUpcoming);
})();
