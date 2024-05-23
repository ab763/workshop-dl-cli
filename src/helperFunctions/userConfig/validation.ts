const path = require('node:path');
const fs = require('fs-extra');

const dirValidation = async dirPath =>
	(
		Boolean(dirPath)
    && path.isAbsolute(dirPath)
    && (await fs.pathExists(dirPath))
    && (await fs.stat(dirPath)).isDirectory()
	);

const ToInteger = x =>
{
	x = Number(x);
	return x < 0 ? Math.ceil(x) : Math.floor(x);
};

const integerValidation = x =>
	x === ToInteger(x);

const saveDirValidation = async dirPath =>
	dirValidation(dirPath);

const tmpDirValidation = async dirPath =>
	dirValidation(dirPath);

const concurrencyValidation = async concurrency =>
	integerValidation(concurrency) && concurrency <= 6 && concurrency >= 1;

const transferProgressTimeoutValidation = async time =>
	integerValidation(time) && time && time >= 5000;

const configValidation = async userConfig =>
{
	const saveDir = userConfig.get('path.saveDir');
	const tmpDir = userConfig.get('path.tmpDir');
	const concurrency = userConfig.get('process.concurrency');
	const transferProgressTimeout = userConfig.get(
		'process.transferProgressTimeout',
	);

	const isValidSaveDir = await saveDirValidation(saveDir);
	const isValidTmpDir = await tmpDirValidation(tmpDir);
	const isValidConcurrency = await concurrencyValidation(concurrency);
	const isValidTransferProgressTimeout = await transferProgressTimeoutValidation(
		transferProgressTimeout,
	);

	const errors = [];

	if (!isValidTmpDir)
	{
		errors.push('TEMP_FOLDER');
	}

	if (!isValidSaveDir)
	{
		errors.push('SAVE_LOCATION');
	}

	if (!isValidConcurrency)
	{
		errors.push('CONCURRENCY');
	}

	if (!isValidTransferProgressTimeout)
	{
		errors.push('TRANSFER_PROGRESS_TIMEOUT');
	}

	return {valid: errors.length === 0, errors};
};

module.exports.configValidation = configValidation;
module.exports.saveDirValidation = saveDirValidation;
module.exports.tmpDirValidation = tmpDirValidation;
module.exports.concurrencyValidation = concurrencyValidation;
module.exports.transferProgressTimeoutValidation = transferProgressTimeoutValidation;
module.exports.dirValidation = dirValidation;
module.exports.integerValidation = integerValidation;
