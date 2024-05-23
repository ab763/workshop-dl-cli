const {expect, test} = require('@oclif/test');
const retry = require('../../src/helperFunctions/retry');

describe('retry', () =>
{
	test
		.do(async () => await retry())
		.catch('Missing unsafe function')
		.it('should give error on missing unsafeFunction');

	test
		.do(
			async () =>
				await retry(() =>
				{
					throw new Error('error thrown');
				}),
		)
		.catch('', {raiseIfNotThrown: false})
		.it('should not throw error if args are missing except first (unsafe)');

	test
		.stdout()
		.do(async () =>
		{
			const failingFunction = () =>
			{
				console.log('fail');
				throw new Error('fail');
			};

			const catchFunction = () =>
			{
				console.log('catch');
			};

			const doomedFunction = () =>
			{
				console.log('doom');
			};

			const forceExit = () =>
			{
				console.log('forceExit');
			};

			await retry(failingFunction, catchFunction, doomedFunction, forceExit, 1);
		})
		.it('should follow proper pattern on fail', output =>
		{
			expect(output.stdout).to.equal('forceExit\nfail\ncatch\ndoom\n');
		});

	test
		.stdout()
		.do(async () =>
		{
			const failingFunction = () =>
			{
				console.log('fail');
			};

			const catchFunction = () =>
			{
				console.log('catch');
			};

			const doomedFunction = () =>
			{
				console.log('doom');
			};

			const forceExit = () =>
			{
				console.log('forceExit');
			};

			await retry(failingFunction, catchFunction, doomedFunction, forceExit, 1);
		})
		.it('should follow proper pattern on success', output =>
		{
			expect(output.stdout).to.equal('forceExit\nfail\n');
		});

	test
		.stdout()
		.do(async () =>
		{
			let retries = 0;
			const failingFunction = () =>
			{
				console.log('fail');
				if (retries < 2)
				{
					throw new Error('error');
				}
			};

			const catchFunction = () =>
			{
				retries++;
				console.log('catch');
			};

			const doomedFunction = () =>
			{
				console.log('doom');
			};

			const forceExit = () =>
			{
				console.log('forceExit');
			};

			await retry(failingFunction, catchFunction, doomedFunction, forceExit, 3);
		})
		.it('should follow proper pattern on success after fail', output =>
		{
			expect(output.stdout).to.equal(
				'forceExit\nfail\ncatch\nforceExit\nfail\ncatch\nforceExit\nfail\n',
			);
		});

	test
		.stdout()
		.do(async () =>
		{
			const failingFunction = () =>
			{
				console.log('fail');
				throw new Error('error');
			};

			const catchFunction = () =>
			{
				console.log('catch');
			};

			const doomedFunction = () =>
			{
				console.log('doom');
			};

			const forceExit = () =>
			{
				console.log('forceExit');
			};

			await retry(failingFunction, catchFunction, doomedFunction, forceExit);
		})
		.it('should exit after n default retries', output =>
		{
			expect(output.stdout).to.contain('doom');
		});
});
