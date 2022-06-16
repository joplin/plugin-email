import joplin from 'api';
import App from './init';

const app = new App();

joplin.plugins.register({
	onStart: async function () {
		console.info('Email Plugin Started!');
		await app.init();
	},
});
