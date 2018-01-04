(function() {
	const currentRunRep = nodecg.Replicant('currentRun')

	class JrBottomInfo extends Polymer.Element {
		static get is() {
			return 'jr-bottom-info';
		}

		ready() {
			super.ready();

			currentRunRep.on('change', newVal => {
				this.commentator = newVal.commentator;
				this.game = newVal.game;
				this.category = newVal.category;
				this.runners = newVal.runners;
			})
		}
	}

	customElements.define(JrBottomInfo.is, JrBottomInfo);
})();
