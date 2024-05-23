import {Args, Command, Flags} from '@oclif/core'
import {config} from '../conf';
import source from 'conf';
import extract from 'extract-zip'
import {readdirSync, rmdir, rmdirSync} from 'node:fs';
import path from 'node:path';
 import fs from 'fs-extra';
import assert from 'node:assert';

export default class Install extends Command
{
	public async run(): Promise<void>
	{

		const downloadDirectory: string = config.get('downloadDirectory');

		const downloads: string[] = readdirSync(downloadDirectory);

		console.log(downloads);

		const downloadedArchives = downloads.filter(file => path.extname(file).localeCompare('.zip', undefined, {sensitivity: 'accent'}) === 0);

		console.log(downloadedArchives);

		for (const downloadedArchive of downloadedArchives)
		{
			await processArchive(downloadDirectory, downloadedArchive);
		}
	}
}

async function processArchive(downloadDirectory: string, downloadedArchive: string)
{
	const downloadedArchivePath = path.join(downloadDirectory, downloadedArchive);

	const extractDirectory = path.resolve(
		downloadDirectory,
		path.parse(downloadedArchive).name
	);

	await extract(downloadedArchivePath, {dir: extractDirectory});

	const extractDirectoryContents = readdirSync(extractDirectory);
	// Mods occassionally include a readme in the archive root directory

	const innerDirectory = path.join(extractDirectory, extractDirectoryContents[0]);

	const innerDirectoryContents = readdirSync(innerDirectory);

	const xComModFiles = innerDirectoryContents.filter((fileSystemItem) => path.extname(fileSystemItem).localeCompare('.XComMod', undefined, {sensitivity: 'accent'}) === 0);

	assert(xComModFiles.length == 1);

	for (const fileSystemItem of innerDirectoryContents)
	{
		// overwrite needed when files like readme exist both in archive root and inner directory
		fs.moveSync(path.join(innerDirectory, fileSystemItem), path.join(extractDirectory, fileSystemItem), {overwrite: true});
	}

	assert(readdirSync(innerDirectory).length === 0);

	rmdirSync(innerDirectory);

	fs.renameSync(extractDirectory, path.join(downloadDirectory, path.parse(xComModFiles[0]).name));
}

