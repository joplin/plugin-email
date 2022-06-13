# Email Plugin

Many of the Joplin users are researchers or workers in different fields. Usually, the university or company deals with them via email, whether it is assignments, articles, reports, etc. So the plugin fetches and parses emails, including attachments, from different email providers by using the IMAP protocol and converts them to Joplin Notes.

## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`. A JPL archive will also be created at the root, which can use to distribute the plugin.

To build the plugin, simply run `npm run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.
