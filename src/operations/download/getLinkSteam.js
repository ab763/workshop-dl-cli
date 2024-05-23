const path = require('node:path');
const { chromium } = require('playwright');
const getPage = require('../../helperFunctions/getBrowserPage');
const retry = require('../../helperFunctions/retry');
const Err = require('../../helperFunctions/err');

const acquireDownloadLink2 = async id =>
{
	const url = `http://steamworkshop.download/download/view/${id}`;
	const browser = await chromium.launch();
	let page = await getPage(browser, {script: true});

	await retry(
		async () =>
		{
			await page.goto(url, {waitUntil: 'networkidle2'});
		},
		async () =>
		{
			await page.close();
			page = await getPage(browser);
		},
		async () =>
		{
			await page.close();
			await browser.close();
			throw new Error('Unable to load first download page');
		},
	);

	const downloadButtonExists = await page.$('#steamdownload.button');
	if (!downloadButtonExists)
	{
		await page.screenshot({
			path: path.join(
				__logDir,
				'STEAMWORKSHOP-mod-unavailable-for-download.png',
			),
			fullPage: true,
		});
		await page.close();
		await browser.close();
		throw new Err('Mod not available for download', 'FAIL');
	}

	try
	{
        await page.click('#steamdownload.button');
    }
	catch
	{
		await page.close();
		await browser.close();
		throw new Err('Steam timeout');
	}

	let downloadLink;
	try
	{
		/* istanbul ignore next */
		downloadLink = await page.$eval('#result > pre > a', dl => dl.href);
	}
	catch
	{
		await page.close();
		await browser.close();
		throw new Err('Currently unavailable for download', 'FAIL');
	}

	await page.close();
	await browser.close();
	if (!downloadLink)
	{
		throw new Error('NO LINK GRABBED');
	}

	return downloadLink;
};

module.exports = acquireDownloadLink2;
