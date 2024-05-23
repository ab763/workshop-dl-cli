const path = require('node:path');
const fs = require('fs-extra');
const getManager = require('../../helperFunctions/manager/getManager');
const Err = require('../../helperFunctions/err');
const unpack = require('./unpack');
const relativePathOf = require('./categoryLocation');

const installer = async (article, downloadedFilePath) =>
{
	const manager = await getManager();

	const unpackedDir = __unpackedDir;
	let unpackedItemDir;
	try
	{
		unpackedItemDir = await unpack(downloadedFilePath, unpackedDir);
	}
	catch (error)
	{
		throw new Err(error.message, 'FAIL');
	}

	const itemFileLink = path.join(unpackedItemDir, 'item.json');
	await fs.ensureFile(itemFileLink);
	await fs.writeJSON(itemFileLink, article);

	const installLocation = path.join(
		__saveDir,
		relativePathOf(article.categories[0]),
		article.id,
	);

	try
	{
		await fs.move(unpackedItemDir, installLocation, {overwrite: true});
	}
	catch
	{
		throw new Err('ERROR WHILE MOVING', 'FAIL');
	}

	manager.set({
		installed: {
			...manager.get('installed'),
			[article.id]: {
				title: article.title,
				updated: article.updated,
				location: installLocation,
				id: article.id,
			},
		},
	});
};

module.exports = installer;
