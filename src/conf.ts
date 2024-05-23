import Conf from 'conf';

export const config = new Conf({
	schema: {
		downloadDirectory: {
			type: 'string',
			default: 'downloads'
		},
	},
});
