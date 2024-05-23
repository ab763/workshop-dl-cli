module.exports = url =>
{
	let filename; let id; let extension;
	try
	{
		const {pathname} = new URL(url);
		const index = pathname.lastIndexOf('/');
		filename = index === -1 ? pathname : pathname.slice(Math.max(0, index + 1));
		if (filename.length === 0)
		{
			throw new Error('invalid filename');
		}

		const possibleId = filename.match(/(\d+)/);
		id = possibleId?.[0];

		const possibleExtension = filename.match(/(.[a-zA-Z]+)$/);
		extension = possibleExtension ? possibleExtension[0] : '';
	}
	catch
	{
		filename = null;
		id = null;
		extension = null;
	}

	const options = {
		filename,
		id,
		extension,
	};
	return options;
};
