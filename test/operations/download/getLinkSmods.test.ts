const {expect, test} = require('@oclif/test');
const download = require('../../../src/src/operations/download/getLinkSmods');

describe('getLinkSmods', () =>
{
	test
		.timeout(1_000_000)
		.it('should get file download link for mod', async () =>
		{
			const link = await download('1625704117');
			expect(link).to.contain('.zip').and.contain('file').and.contain('1625704117');
		});
});
