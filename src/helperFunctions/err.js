class Error_ extends Error
{
	constructor(message, type, ...rest)
	{
		super(message, rest);
		this.type = type;
	}
}

module.exports = Error_;
