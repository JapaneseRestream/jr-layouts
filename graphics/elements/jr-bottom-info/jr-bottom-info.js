/* global Polymer */

(function() {
	const currentRunRep = nodecg.Replicant('currentRun');

	class JrBottomInfo extends Polymer.Element {
		static get is() {
			return 'jr-bottom-info';
		}

		ready() {
			super.ready();

			currentRunRep.on('change', newVal => {
				Polymer.flush();
				this.commentator = newVal.commentator;
				this.game = newVal.game;
				this.category = newVal.category;
				this.console = newVal.console;
				Polymer.RenderStatus.afterNextRender(this, this.fitText);
			});
		}

		fitText() {
			const MAX_WIDTH = this.$.game.clientWidth;
			const currentWidth = this.$.game_text.clientWidth;
			if (MAX_WIDTH < currentWidth) {
				const overflowLength = currentWidth - MAX_WIDTH;
				this.$.game_text.style.transform = `translateX(${0 -
					overflowLength / 2}px) scaleX(${MAX_WIDTH / currentWidth})`;
			} else {
				this.$.game_text.style.transform = `scaleX(1)`;
			}
		}
	}

	customElements.define(JrBottomInfo.is, JrBottomInfo);
})();
