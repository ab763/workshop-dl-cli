const path = require('node:path');
const {Command, Flags} = require('@oclif/core');
const colors = require('ansi-colors');
const download = require('../operations/download/download');
const getMetadata = require('../operations/getMetadata/getMetadata');
const getLinkSteam = require('../operations/download/getLinkSteam');
const getManager = require('../helperFunctions/manager/getManager');
const installItem = require('../operations/install/install');
const promisePool = require('../helperFunctions/promisePool');
const Logger = require('../helperFunctions/logger/logger');

const loggerStates = Logger.states;
const summary = require('../helperFunctions/summary');

class UpdateCommand extends Command
{
	async run()
	{
		const {flags} = this.parse(UpdateCommand);
		//SETUP
		const startTime = process.hrtime();
		const manager = await getManager();

		//START
		console.log(
			colors.yellow('Grabbing Updated Details'),
			colors.grey("(it's not stuck)"),
		);

		const installedItems = manager.get('installed');
		const installedItemsList = Object.values(installedItems);

		let finalItemDirectory = {};
		await promisePool(
			installedItemsList.map(item => () =>
				getMetadata(item.id).then(articlesObject =>
				{
					finalItemDirectory = {...finalItemDirectory, ...articlesObject};
				})),
			__concurrencyLimit,
		);

		const updatedItemDetails = Object.values(finalItemDirectory);
		const toUpdateItemList = updatedItemDetails.filter(item =>
		{
			let installedUpdatedAt;
			try
			{
				installedUpdatedAt = new Date(installedItems[item.id].updated);
			}
			catch
			{
				return true;
			}

			const freshUpdatedAt = new Date(item.updated);
			return freshUpdatedAt - installedUpdatedAt > 0;
		});

		if (toUpdateItemList.length === 0)
		{
			console.log(colors.green('Everything is up to date'));
			return;
		}

		const logger = new Logger({
			total: toUpdateItemList.length,
			disabled: process.env.NODE_ENV === 'test',
		});
		const seq = async article =>
		{
			try
			{
				logger.insert(article);
				logger.update(article.id, loggerStates.grabLink);
				const downloadLink = await getLinkSteam(article.id);

				const downloadedFilePath = await download(
					downloadLink,
					__packedDir,
					undefined,
					progress =>
					{
						logger.update(article.id, loggerStates.download, progress.percent);
					},
				);

				if (!downloadedFilePath)
				{
					logger.update(article.id, loggerStates.fail);
					return;
				}

				logger.update(article.id, loggerStates.install);
				await installItem(article, downloadedFilePath);

				logger.update(article.id, loggerStates.success);
			}
			catch (error)
			{
				if (error.type === 'FAIL')
				{
					logger.update(article.id, loggerStates.fail, null, error.message);
					return;
				}

				logger.update(article.id, loggerStates.warn, null, error.message);
				return Promise.reject(error);
			}
		};

		await promisePool(
			toUpdateItemList.map(article => () => seq(article)),
			__concurrencyLimit,
		);

		const timeTaken = process.hrtime(startTime);
		const stats = {
			...logger.stats,
			time: timeTaken,
			successWrd: 'updated',
		};
		console.log(summary(stats));
	}
}

UpdateCommand.description = 'Updates all of the items installed. Will also install missing dependencies (required items) if any.';

module.exports = UpdateCommand;
