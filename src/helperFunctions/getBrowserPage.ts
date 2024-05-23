import {type Browser} from 'puppeteer';

export async function getBrowserPage(browser: Browser, scriptsAllowed: boolean)
{
	const page = await browser.newPage();

	const resourceTypesAllowed = new Set<string>(['document']);

	if (scriptsAllowed)
	{
		resourceTypesAllowed.add('script');
	}
	else
	{
		page.setJavaScriptEnabled(false);
	}

	await page.setRequestInterception(true);
	page.on('request', interceptedRequest =>
	{
		if (resourceTypesAllowed.has(interceptedRequest.resourceType()))
		{
			interceptedRequest.continue();
		}
		else
		{
			interceptedRequest.abort();
		}
	});

	return page;
}
