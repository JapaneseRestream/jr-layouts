(function() {
	const logosRep = nodecg.Replicant('assets:logos');

	class JrLogos extends Polymer.Element {
		static get is() {
			return 'jr-logos';
		}

		ready() {
			super.ready();

			logosRep.on('change', newVal => {
				this.$.logo.style.opacity = 0;

				if (newVal.length === 0) {
					return;
				}

				const logoUrls = newVal.map(logo => logo.url);
				const showElement = index => {
					this.logoUrl = logoUrls[index];
					this.$.logo.style.opacity = 1;
				}
				const hideElement = () => {
					this.$.logo.style.opacity = 0;
				}

				clearInterval(this.logoInterval);

				showElement(0);

				if (newVal.length === 1) {
					return;
				}

				let currentLogoIndex = 0;
				this.logoInterval = setInterval(() => {
					hideElement();
					currentLogoIndex = (currentLogoIndex + 1) % newVal.length;
					setTimeout(() => {
						showElement(currentLogoIndex);
					}, 0.33 * 1000);
				}, (10 + 0.33) * 1000);
			})
		}
	}

	customElements.define(JrLogos.is, JrLogos);
})();
