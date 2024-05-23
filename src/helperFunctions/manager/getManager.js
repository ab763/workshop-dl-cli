const path = require('node:path');
const Conf = require('conf');
const fs = require('fs-extra');
const schema = require('./managerSchema');

const getManager = async () =>
{
	const options = {
		schema,
		configName: 'manager',
		cwd: __saveDir,
	};
	let manager;
	try
	{
		manager = new Conf(options);
	}
	catch
	{
		await fs.remove(path.join(__saveDir, 'manager.json'));
		manager = new Conf(options);
	}

	return manager;
};

module.exports = getManager;
