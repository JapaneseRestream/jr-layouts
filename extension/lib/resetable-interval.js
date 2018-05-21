const is = require('@sindresorhus/is')

class ResetableInterval {
	constructor(fn, delay) {
		this.fn = this.validFn(fn)
		this.delay = this.validDelay(delay)
	}

	start(...args) {
		this.interval = setInterval(this.fn, this.delay, ...args)
	}

	call(...args) {
		return this.fn(...args)
	}

	reset(fn, delay, ...args) {
		if (!is.nullOrUndefined(fn)) {
			this.fn = this.validFn(fn)
		}
		if (!is.nullOrUndefined(delay)) {
			this.delay = this.validDelay(delay)
		}
		this.stop()
		this.interval = setInterval(this.fn, this.delay, ...args)
	}

	stop() {
		clearInterval(this.interval)
		delete this.interval
	}

	validFn(fn) {
		if (is.function(fn)) {
			return fn
		}
		throw new TypeError('Interval callback should be function')
	}

	validDelay(delay) {
		if (is.number(delay)) {
			return delay
		}
		throw new TypeError('Interval delay should be number')
	}
}

module.exports = ResetableInterval
