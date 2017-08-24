import Http from './Http';

const root = 'https://jsonplaceholder.typicode.com/posts/';

const config = {
	skipStatus : true
};

describe('Http wrapper', () => {
	describe('should GET data', () => {
		it('and should have 4 keys in response', async () => {
			let response = await Http.fetch(`${root}1`, config);
			assert.equal(Object.keys(response).length, 4);
		});

		it('and should have 4 keys in response using shorthand', async () => {
			let response = await Http.get(`${root}1`, config);
			assert.equal(Object.keys(response).length, 4);
		});
	});

	describe('should POST data', () => {
		it('and should have `id` property in response', async () => {
			let response = await Http.post(root, config);
			assert.isTrue('id' in response);
		});
	});
});