import {Download, errors, type Page} from 'playwright';

export async function download(smodsPage: Page, appId: number, steamId: number): Promise<Download>
{
	await smodsPage.goto(`http://catalogue.smods.ru/?s=${steamId}&app=${appId}`);

	// smodsPage.setDefaultTimeout(2500);
	for (let i = 0; i < 3; ++i)
	{
		const xButton = smodsPage.frameLocator('iframe').getByText('×');
		if (await xButton.isVisible())
		{
			await xButton.click();
		}

		const popupPromise = smodsPage.waitForEvent('popup');
		const downloadButton = smodsPage.getByRole('link', {name: 'Download'});
		await downloadButton.click();

		let popup: Page;
		try
		{
			popup = await popupPromise;
		}
		catch (error)
		{
			if (error instanceof errors.TimeoutError)
			{
				continue;
			}
			else
			{
				throw error;
			}
		}

		const url = popup.url();

		if (new URL(url).hostname.localeCompare('modsbase.com', undefined, {sensitivity: 'accent'}) !== 0)
		{
			// popup.close();
			continue;
		}

		return await modsBaseInitiateDownload(popup, smodsPage);
	}

	throw new Error('Opening popup failed');
}

export async function modsBaseInitiateDownload(modsBasePage: Page, smodsPage?: Page)
{
	await modsBasePage.getByRole('button', {name: 'Create download link'}).click();
	console.log('Setting up download promise');
	const downloadPromise = modsBasePage.waitForEvent('download');
	console.log('Finding download link');
	const downloadLink = modsBasePage.getByRole('link', {name: 'Download file'});
	console.log(`Clicking ${downloadLink}`);
	await downloadLink.click();
	// if (typeof smodsPage !== 'undefined')
	// {
	// 	console.log(`Closing ${smodsPage.url()}`)
	// 	await smodsPage.close();
	// }
	
	return downloadPromise;
}

