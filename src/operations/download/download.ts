import {directory} from '@oclif/core/lib/args';
import {config} from '../../conf';

const stream = require('node:stream');
const path = require('node:path');
const {promisify} = require('node:util');
const fs = require('fs-extra');
const got = require('got');
const parseFileUrl = require('../../helperFunctions/parseFileUrl');
const Err = require('../../helperFunctions/err');

const pipeline = promisify(stream.pipeline);

async function download(url: URL, onProgress: (argument0: any) => void)
{
	config.get('downloadDirectory');
	// Document example url, example fromUrl, example fileName
	const fromURL = parseFileUrl(url);
	filename = `${filename}${fromURL.extension}`;

	return new Promise((resolve, reject) =>
	{
		const downloadStream = got
			.stream(url)
			.on('response', async response =>
			{
				if (response.headers['content-type'].includes('application'))
				{
					// Valid file
					let noProgressTimer;
					const noProgressTimeout = 5000;

					downloadStream.on('downloadProgress', progress =>
					{
						if (noProgressTimer)
						{
							clearTimeout(noProgressTimer);
						}

						onProgress(progress);
						noProgressTimer = setTimeout(() =>
						{
							try
							{
								downloadStream.destroy();
							}

							finally
							{}
						}, noProgressTimeout);
					});

					// Setting up file
					await fs.ensureDir(directory);
					const fileLink = path.join(directory, filename);
					const fileWriteStream = fs.createWriteStream(fileLink);

					// Downloading
					try
					{
						await pipeline(downloadStream, fileWriteStream);
						clearTimeout(noProgressTimer);
					}
					catch
					{
						clearTimeout(noProgressTimer);
						await fs.remove(fileLink);
						reject(new Error('Download Stuck'));
					}

					resolve(fileLink);
				}

				else
				{
					// Not a file
					let completeResponse = '';
					for await (const chunk of downloadStream)
					{
						completeResponse += chunk;
					}

					reject(new Err(`Not a file: ${completeResponse}`, 'FAIL'));
				}
			})
			.on('error', e =>
			{
				reject(e);
			});
	});
};

module.exports = download;
