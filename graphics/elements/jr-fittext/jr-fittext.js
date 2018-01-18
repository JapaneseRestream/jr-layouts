/* global Polymer */

(function () {
	class JrFittext extends Polymer.Element {
		static get is() {
			return 'jr-fittext';
		}

		static get properties() {
			return {
				text: {
					type: String,
					observer: 'fitText'
				}
			};
		}

		fitText() {
			Polymer.RenderStatus.afterNextRender(this, () => {
				const MAX_WIDTH = this.$.container.clientWidth;
				const currentWidth = this.$.text.clientWidth;
				if (currentWidth > MAX_WIDTH) {
					this.$.text.style.transform = `scaleX(${MAX_WIDTH / currentWidth})`;
				} else {
					this.$.text.style.transform = `scaleX(1)`;
				}
			});
		}
	}

	customElements.define(JrFittext.is, JrFittext);
})();
