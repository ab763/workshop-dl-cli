const path = require('node:path');

const defaultSaveDir = () =>
{
	const homeDirLoc
    = process.env.LOCALAPPDATA
    || (process.platform == 'darwin'
    	? path.join(process.env.HOME, '/Library/Application Support')
    	: path.join(process.env.HOME, '/.local/share'));

	const locationInHomeDir = '/Colossal Order/Cities_Skylines/';
	return path.join(homeDirLoc, locationInHomeDir);
};

const defaultTmpDir = () =>
	path.join(__dirname, '..', '..', '..', 'tmp');

const defaultConcurrency = () =>
	5;

const defaultTransferProgressTimeout = () =>
	5000;

const defaultConfig = {
	path: {
		saveDir: defaultSaveDir(),
		tempDir: defaultTmpDir(),
	},
	process: {
		concurrency: defaultConcurrency(),
		transferProgressTimeout: defaultTransferProgressTimeout(),
	},
};

module.exports = {
	get config()
	{
		return defaultConfig;
	},
	get saveDir()
	{
		return defaultSaveDir();
	},
	get tmpDir()
	{
		return defaultTmpDir();
	},
	get concurrency()
	{
		return defaultConcurrency();
	},
	get transferProgressTimeout()
	{
		return defaultTransferProgressTimeout();
	},
};
