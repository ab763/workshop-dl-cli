import {homedir} from 'node:os';
import {join} from 'node:path';
import {chromium, type BrowserContext, firefox} from 'playwright';

export async function launchBrowser(hideAutomation: boolean): Promise<BrowserContext>
{
	// 	When running in Debug Mode with PWDEBUG=console, a playwright object is available in the Developer tools console. Developer tools can help you to:
	//     Inspect the DOM tree and find element selectors
	//     See console logs during execution (or learn how to read logs via API)
	//     Check network activity and other developer tools features
	// This will also set the default timeouts of Playwright to 0 (= no timeout).
	process.env.PWDEBUG = 'console';

	// const browserType = chromium;
	// const browserName = 'Chromium';

	const browserType = firefox;
	const browserName = 'Firefox';

	const userDataDir = join(homedir(), 'browser-cache', `${browserName}NoVPN`);

	const options = {
		headless: false, ignoreDefaultArgs: ['--disable-extensions'], strictSelectors: true, viewport: null,
	};

	let browserContext: BrowserContext;
	if (hideAutomation && browserType === chromium)
	{
		browserContext = await browserType.launchPersistentContext(
			userDataDir,
			{args: ['--disable-blink-features=AutomationControlled'], ...options});
	}
	else
	{
		browserContext = await browserType.launchPersistentContext(
			userDataDir,
			options);
	}

	// Reset default timeout back to Playwright's default of 30 seconds
	browserContext.setDefaultTimeout(30_000);

	return browserContext;
}
