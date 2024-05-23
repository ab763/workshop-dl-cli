const colors = require('ansi-colors');
const choose = require('../../helperFunctions/enquirerPrompts/choose');
const retry = require('../../helperFunctions/retry');
const promisePool = require('../../helperFunctions/promisePool');
const Err = require('../../helperFunctions/err');
const selectFromList = require('../../helperFunctions/enquirerPrompts/selectList');
const parseItem = require('./parseItem');
const parseCollection = require('./parseCollection');

const articleResolver = async (
	id,
	finalItemDirectory,
	browser,
	pendingStage = [],
) =>
{
	const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}&l=english`;
	let page = await browser.newPage();

	await retry(
		async () =>
		{
			await page.goto(url, {waitUntil: 'networkidle2'});
			await page.waitForFunction(
				() =>
					(
						document.querySelector('.breadcrumbs')
            || document.querySelector('.error_ctn')
					),
				{timeout: 20_000},
			);
		},
		async () =>
		{
			await page.close();
			page = await getPage(browser);
		},
		async () =>
		{
			const options = {
				async 'Ignore this item'()
				{
					console.log('IGNORING ITEM');
					await page.close();
					throw new Err('Unable to load steam page');
				},
				async 'Quit Program'()
				{
					console.log('EXITING...');
					await page.close();
					process.exit();
				},
			};
			const message = 'Unable to load steam page. Choose one:';
			await choose(message, options);
		},
		() =>
		{},
	);

	if (await page.$('.error_ctn'))
	{
		await page.close();
		throw new Err('No such item found.', 'FAIL');
	}

	const breadcrumbs = await page.$eval('.breadcrumbs', string_ =>
		string_.innerText.toLowerCase());

	const isCollection = Boolean(await page.$('.collectionChildren'));

	if (isCollection)
	{
		const collectionDetails = await parseCollection(page);
		console.log(`${colors.green(collectionDetails.title)} collection found`);

		let res;
		if (__edit)
		{
			res = await selectFromList(
				collectionDetails.collectionItems,
				'Collection Items',
			);
		}
		else
		{
			res = collectionDetails.collectionItems;
		}

		console.log(
			colors.yellow('Grabbing rest of the details'),
			`${colors.grey('(this may take a while)')}`,
		);

		await promisePool(
			res.map(item => () =>
				articleResolver(item.id, finalItemDirectory, browser)),
			8,
		);
	}
	else
	{
		const itemDetails = await parseItem(page);

		if (itemDetails.requirements.length > 0)
		{
			pendingStage.push(id);
			//Requirements are present
			for (requirementId of itemDetails.requirements)
			{
				if (
					!finalItemDirectory[requirementId]
          && !pendingStage.includes(requirementId)
				)
				{
					try
					{
						await articleResolver(
							requirementId,
							finalItemDirectory,
							browser,
							pendingStage,
						);
					}
					catch (error)
					{
						console.log(error.message);
					}
				}
			}

			pendingStage.pop();
		}

		itemDetails.id = id;
		finalItemDirectory[id] = itemDetails;
	}
};

module.exports = articleResolver;
