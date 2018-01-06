(function(){
	class JrGamePlate extends Polymer.Element {
		static get is() {
			return 'jr-game-plate';
		}

		static get properties() {
			return {
				game: {
					type: String,
					observer: 'gameChanged'
				},
				category: String,
				runners: String
			}
		}

		gameChanged() {
			Polymer.RenderStatus.afterNextRender(this, this.fitGame);
		}
		
		fitGame() {
			const MAX_WIDTH = this.$.game.clientWidth;
			const currentWidth = this.$.game_text.clientWidth;
			if (currentWidth > MAX_WIDTH) {
				this.$.game_text.style.transform = `scaleX(${MAX_WIDTH / currentWidth})`
			} else {
				this.$.game_text.style.transform = `scaleX(1)`
			}
		}
	}
	customElements.define(JrGamePlate.is, JrGamePlate);
})();
