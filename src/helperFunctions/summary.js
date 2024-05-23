const colors = require('ansi-colors');
const pretty = require('pretty-time');

const summary = stats =>
{
	this.success = stats.success;
	this.fail = stats.fail;
	this.warn = stats.warn;
	this.total = stats.total;
	this.time = stats.time;
	this.successWrd = stats.successWrd;

	const succString = `${colors.green(this.success)}${
		this.total ? colors.grey(`/${this.total}`) : ''
	} ${this.successWrd} `;

	const retryString = `${colors.yellow(this.warn)} ${
		this.warn === 1 ? 'retry' : 'retries'
	}`;

	const failString = `${colors.red(this.fail)} ${
		this.fail === 1 ? 'failure' : 'failures'
	}`;

	const timeString = this.time ? `in ${colors.blue(pretty(this.time, 's'))} ` : '';

	const extrasString = `${
		this.fail !== undefined || this.warn !== undefined
			? `with ${
				this.warn !== undefined && this.fail !== undefined
					? `${retryString} and ${failString}`
					: `${this.warn === undefined ? failString : retryString}`
			} `
			: ''
	}`;

	const fullString = `${succString}${extrasString}${timeString}`;

	return fullString;
};

module.exports = summary;
