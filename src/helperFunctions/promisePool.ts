const colors = require('ansi-colors');

const promisePool = async (operationList, maxFlow = 5) =>
{
	const tokens = Array.from({length: Math.min(maxFlow, operationList.length)}).fill(
		Promise.resolve(),
	);

	const stats = {
		total: operationList.length,
		successfull: -tokens.length,
		retries: 0,
	};

	const operationListCopy = [...operationList];

	const giveTo = (promise, operationOfPromise, tokenNo) =>
		promise
			.then(opId =>
			{
				stats.successfull++;
			})
			.catch(error =>
			{
				// Console.log(colors.red("Caught by Pool"), error);
				stats.retries++;
				operationListCopy.push(operationOfPromise);
			})
			.finally(() =>
			{
				if (operationListCopy.length > 0)
				{
					// GETTING NEW OPERATION
					const newOperation = operationListCopy.shift();
					const newPromise = newOperation(tokenNo);
					return giveTo(newPromise, newOperation, tokenNo);
				}
			});

	await Promise.all(tokens.map(giveTo));
	return stats;
};

module.exports = promisePool;
