/* eslint-disable import/extensions */
import process from 'node:process';
import {writeFileSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {Args, Command, Flags} from '@oclif/core';
import {url} from '@oclif/core/lib/args';
import {type Download} from 'playwright';
import {launchBrowser} from '../browser';
import {download as downloadSmods} from '../operations/download/getLinkSmods';
import {type WorkshopItem as WorkshopItemMetadata} from '../workshopItem';
import {filename as workshopItemFilename} from '../workshopItemFilename';
import {config} from '../conf';
const installItem = require('../operations/install/install');
const fetchWorkshopItemsMetdata = require('../operations/getMetadata/getMetadata');
const getLinkSWD = require('../operations/download/getLinkSteam');
const download = require('../operations/download/download');
const summary = require('../helperFunctions/summary');
const promisePool = require('../helperFunctions/promisePool');
const Logger = require('../helperFunctions/logger/logger');
const Err = require('../helperFunctions/err');

const loggerStates = Logger.states;

const sources = ['SWD', 'SMODS'];

export class DownloadCommand extends Command
{
	async run()
	{
		const {flags, args} = await this.parse(DownloadCommand);

		global.__edit = flags.edit;

		const downloadDirectory: string = config.get('downloadDirectory');
		const savedFiles: string[] = readdirSync(downloadDirectory);
		const savedFilesWithoutExtension: string[] = savedFiles.map(savedFile => path.parse(savedFile).name);
		const workshopItemsFilePath = 'test/fixtures/workshopItemsObject.json';

		// Todo: fetchWorkshopItemsMetdata should return collection not object
		const workshopItemsMetadata: WorkshopItemMetadata[] = Object.values(
			JSON.parse(readFileSync(workshopItemsFilePath)),
			// Await fetchWorkshopItemsMetdata(args.steamId)
		);
		// WriteFileSync('workshopitems.json', JSON.stringify(workshopItemsMetadata));

		// Todo: Merge filename functionality back into class

		const workshopItemFileNames = workshopItemsMetadata.map(workshopItem => workshopItemFilename(workshopItem.title));

		savedFilesWithoutExtension.forEach(savedFile =>
		{
			if (!workshopItemFileNames.includes(savedFile))
			{
				throw new Error(`${savedFile} not found in ${workshopItemFileNames}`);
			}
		});

		const logger = new Logger({
			total: workshopItemsMetadata.length,
			disabled: process.env.NODE_ENV === 'test',
		});

		const itemsToDownload = workshopItemsMetadata.filter(item => !savedFilesWithoutExtension.includes(workshopItemFilename(item.title)));

		console.log(`Items to download: ${itemsToDownload.length}`);

		const browser = await launchBrowser(true);
		const page = browser.pages()[0];

		for (const workshopItem of itemsToDownload)
		{
			// Logger.insert(workshopItem);

			// logger.update(workshopItem.id, loggerStates.grabLink);

			let downloadPromise: Promise<Download>;
			switch (flags.source)
			{
				case 'SWD': {
					downloadLink = await getLinkSWD(browser, workshopItem.id);
					break;
				}

				case 'SMODS': {
					// Todo
					downloadPromise = downloadSmods(page, 268_500, workshopItem.id);
					break;
				}
			}

			const download: Download = await downloadPromise;

			// Todo: Document modsbase download url

			const downloadPath = path.join(downloadDirectory, workshopItemFilename(workshopItem.title) + path.parse(download.suggestedFilename()).ext);
			await download.saveAs(downloadPath);

			// 	Await installItem(workshopItem, downloadedFilePath);
		}
	}
}

DownloadCommand.description = 'Download a single mod or a collection along with their dependencies. Use id in steam URL as the SteamID.';

DownloadCommand.flags = {
	edit: Flags.boolean({
		char: 'e',
		description:
			'Select collection items (ignored if a single item)',
		default: false,
	}),
	source: Flags.string({
		char: 's',
		description: 'download from steamworkshop.download or smods?',
		options: sources,
		default: 'SMODS',
	}),
};

DownloadCommand.args = {
	steamId: Args.string(
		{
			name: 'steamId',
			description: 'item or collection SteamID',
		}),
};
