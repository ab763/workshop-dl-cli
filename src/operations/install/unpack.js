const path = require('node:path');
const fs = require('fs-extra');
const Zip = require('adm-zip');

const unzip = async (source, destination) =>
{
	if (!path.isAbsolute(source))
	{
		throw new Error('Source is not absolute');
	}

	if (!path.isAbsolute(destination))
	{
		throw new Error('Destination is not absolute');
	}

	try
	{
		if (!(await fs.stat(source)).isFile())
		{
			throw new Error('Not a file');
		}
	}
	catch (error)
	{
		throw new Error(`Source: ${error.message}`);
	}

	await fs.ensureDir(destination);
	const zip = new Zip(source);
	let outputDirectory;

	//Zip.extractAllTo(destination, true);
	const entries = zip.getEntries();

	for (entry of entries)
	{
		if (!entry.isDirectory)
		{
			const regex = /[/|(\\)]/;
			const allDirectories = entry.entryName.split(regex);
			entry.entryName = allDirectories.join('/');
			if (allDirectories.length <= 1)
			{
				continue;
			}

			outputDirectory ||= allDirectories[0];
		}
	}

	if (!outputDirectory)
	{
		throw new Error('Bad file');
	}

	zip.extractAllTo(destination);

	return path.join(destination, outputDirectory);
};

module.exports = unzip;
