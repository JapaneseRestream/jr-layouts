(function(){
	class JrGamePlate extends Polymer.Element {
		static get is() {
			return 'jr-game-plate';
		}

		static get properties() {
			return {
				game: String,
				misc: String
			}
		}
	}
	customElements.define(JrGamePlate.is, JrGamePlate);
})();
