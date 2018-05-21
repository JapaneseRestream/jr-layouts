const is = require('@sindresorhus/is');

class ResetableInterval {
	constructor(fn, delay) {
		this.fn = this._validFn(fn);
		this.delay = this._validDelay(delay);
	}

	start(...args) {
		this.interval = setInterval(this.fn, this.delay, ...args);
	}

	call(...args) {
		return this.fn(...args);
	}

	reset(...args) {
		this.stop();
		this.start(...args);
	}

	stop() {
		clearInterval(this.interval);
	}

	_validFn(fn) {
		if (is.function(fn)) {
			return fn;
		}
		throw new TypeError('Interval callback should be function');
	}

	_validDelay(delay) {
		if (is.number(delay)) {
			return delay;
		}
		throw new TypeError('Interval delay should be number');
	}
}

module.exports = ResetableInterval;
