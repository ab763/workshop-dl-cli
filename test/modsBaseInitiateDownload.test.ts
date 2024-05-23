const browser = require('../src/browser');
const getLinkSmods = require('../src/operations/download/getLinkSmods');

test('modsBase initial download', async () =>
{
	const page = (await browser.launchBrowser(true)).pages()[0];
	page.goto('https://modsbase.com/tju7nz2d8mut/667104300__WotC__Mod_Config_Menu.zip.html');
	await getLinkSmods.modsBaseInitiateDownload(page);
});
