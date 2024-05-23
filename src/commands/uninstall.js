const {Command} = require('@oclif/core');
const colors = require('ansi-colors');
const {AutoComplete} = require('enquirer');
const deleteItem = require('../operations/delete/deleteItem');
const getManager = require('../helperFunctions/manager/getManager');
const summary = require('../helperFunctions/summary');

class UninstallCommand extends Command
{
	async run()
	{
		const {args} = this.parse(UninstallCommand);
		const {steamId} = args;

		const manager = await getManager();
		const itemInstalled = Object.values(manager.get('installed'));
		if (itemInstalled.length === 0)
		{
			console.log("You don't have any mods installed.");
			return;
		}

		if (steamId)
		{
			try
			{
				const deletedItem = await deleteItem(steamId);
				console.log(colors.red('Successfully Uninstalled'), deletedItem);
			}
			catch (error)
			{
				console.log('Error Uninstalling:', error.message);
			}

			return;
		}

		const selectToDelete = new AutoComplete({
			name: 'selectItems',
			message: `${colors.bold('Select items to be deleted:')}`,
			separator()
			{
				return colors.yellow(this.symbols.bullet);
			},
			hint: '(start typing to search, <space> to select, <return> to submit)',

			limit: 15,
			styles: {em: colors.yellow.inverse},
			choices: [
				{role: 'separator'},
				...itemInstalled.map(item =>
					({
						name: item.title,
						value: item,
					})),
			],
			multiple: true,
			format()
			{
				return `${colors.red(this.selected.length)}${colors.dim(
					`/${itemInstalled.length}`,
				)}${this.input ? `, search: ${colors.blue(this.input)}` : ''}`;
			},
			indicator(state, choice)
			{
				if (choice && choice.enabled)
				{
					return colors.red.bold(state.symbols.minus);
				}

				return colors.white(state.symbols.bullet);
			},
			choiceMessage(choice, i)
			{
				if (choice)
				{
					return choice.enabled ? colors.red(choice.message) : choice.message;
				}
			},
			footer()
			{
				return colors.dim('(Scroll up and down to reveal more choices)');
			},
			result(titles)
			{
				return this.map(titles);
			},
		});

		let results;
		try
		{
			results = await selectToDelete.run();
		}
		catch (error)
		{
			console.log('Nothing Uninstalled', error);
			return;
		}

		const initTime = process.hrtime();
		const itemsToDelete = Object.values(results);
		let deletedCount = 0;
		let failedToDeleteCount = 0;
		const totalCount = itemsToDelete.length;
		for (const item of itemsToDelete)
		{
			try
			{
				const deletedItem = await deleteItem(item.id);
				console.log(colors.red('Successfully Uninstalled'), deletedItem);
				deletedCount++;
			}
			catch (error)
			{
				console.log(colors.red(`Error Uninstalling ${item.title}:`), error.message);
				failedToDeleteCount++;
			}
		}

		const endTime = process.hrtime(initTime);
		console.log(
			summary({
				success: deletedCount,
				fail: failedToDeleteCount,
				total: totalCount,
				time: endTime,
				successWrd: 'deleted',
			}),
		);
	}
}

UninstallCommand.description = 'Uninstall an item';

UninstallCommand.args = [
	{name: 'steamId', description: 'SteamID of installed item'},
];

module.exports = UninstallCommand;
