<h1 align = "center" > Email Plugin </h1>

This plugin adds the ability to fetch email messages (including attachments) and converts them to Joplin notes in various formats, either by monitoring any `new` or `unread` messages from a specific email address or a specific mailbox, or by uploading downloaded email messages to the plugin without having to be logged in.

***

## Installing Plugin

- Open Joplin
- Go to Tools > Options > Plugins
- Search for `Email Plugin`
- Click Install plugin
- Restart Joplin to enable the plugin

***

## Features

- Monitoring and fetching any `new` or `unread` messages from a specific email address.

- Monitoring and fetching any `new` or `unread` messages from a specific mailbox.

- Send the converted message to specific notebooks and add tags to the note by using `@` or `#` in the email subject or first line of email content and then forward the email to yourself.

- Convert emails (including attachments) to notes without having to be logged into the plugin.

- Convert email messages to notes in different formats (`HTML`, `Markdown`, `Text`).

- Show attachments in different styles, whether they are in the form of a `Table` or `Links`.

***

## How to use

- ### Monitoring and fetching from a specific email address

  - Open Email Plugin.

  - Login to the plugin with your email address and password.

  - Enter the email account you want to start fetching and monitoring `new` or `unread` messages from and click on the `Fetching & Monitoring` toggle.

    - If you enter your email address in the `from` field, simply forward the email message to yourself after adding some easy syntax to the end of the email subject, or add this syntax in a new line at the beginning of the message content, and the plugin will handle the rest.

      - **Set a note title** : Change note title by changing the subject of the email.
      - **Add to a notebook** : Add `@notebook` to send it to a specific notebook.
      - **Add tags** : Add `#tag` to organize the note with a tag.

        > **For example**: Say you want this email located in the **joplin** and **gmail** folders and also want to add **gmail** and **email** as tags to the note. Just edit the email subject or add a new line at the beginning of the message content like this:
        >>Email subject: My message @**joplin** @**email** #**gmail** #**email**
        
        https://user-images.githubusercontent.com/58605547/188909511-479bff3b-bb9c-42da-9d48-a29d8b22fd4b.mp4
        
    - Otherwise the email messages will be in the `email messages` folder.

***

- ### Monitoring and fetching from a specific mailbox

  - Open Email Plugin.

  - Login to the plugin with your email address and password.

  - Select a specific mailbox and notebook in which you want the email messages to be located and click on the `Fetching & Monitoring Mailbox` toggle.

***

- ### Upload downloaded email messages

  - Open Email Plugin.

  - Click on the `convert saved messages` button.
  
  - Upload `.eml` format files of email messages that you want to convert to notes.

  - Select a notebook, enter the tags, select the export options, and click on the `convert` button.

## Important Notes

- ⚠️ Make sure the email provider allows login using the original password; otherwise, use the [app password](https://support.google.com/accounts/answer/185833?hl=en#:~:text=Create%20%26%20use%20App%20Passwords).

- If you want to change the note format, remove attachments from the note, or change the attachments style while monitoring, go to `Tools` > `Email Plugin`.

- If you mention folders or tags that don't exist in Joplin, they will be created automatically.

- If you open the email message, the message is no longer `new` or `unread`, but you can easily mark it as unread again.

## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`. A JPL archive will also be created at the root, which can use to distribute the plugin.

To build the plugin, simply run `npm run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

## Testing

To test the plugin, simply run `npm test`. The testing library used is [Jest](https://jestjs.io/).
