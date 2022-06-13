import joplin from 'api';

joplin.plugins.register({
	onStart: async function () {
		console.info("Email plugin started!");
	},
});
