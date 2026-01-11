<h1 align = "center" > Email Plugin </h1>

This plugin allows you to fetch email messages (including attachments) and convert them into Joplin notes in multiple formats.

Emails can be processed automatically by monitoring `new` or `unread` messages from a specific email address or mailbox, or manually by uploading downloaded email messages in `.eml` format without needing to log in to the plugin.


***

## Installing Plugin

- Open Joplin
- Go to Tools > Options > Plugins
- Search for `Email Plugin`
- Click Install plugin
- Restart Joplin to enable the plugin

***

## Features

- Monitor and fetch **new or unread emails** from a specific email address.

- Monitor and fetch **new or unread emails** from a selected mailbox.

- You can control how notes are created using simple syntax in the **email subject** or the **first line of the email body**:
  - `@notebook` → save the note to a specific notebook
  - `#tag` → add tags to the note
  - `!Subject` → create a **Todo** note

- Convert email messages (including attachments) into notes **without being logged into the plugin**.

- Convert emails into notes using different output formats:
  - `HTML`
  - `Markdown`
  - `Plain Text`

- Display attachments in multiple styles, such as:
  - `Table`
  - `Links`

***

## How to use

- ### 🔍 Monitoring and Fetching from a Specific Email Address

  1. Open the **Email Plugin**.
  2. Sign in with your email credentials.
  3. Enter the email account you want to **monitor for new or unread messages**, then enable **Fetching & Monitoring**.

  #### ✉️ Forwarding Emails to Create Notes
    If you enter **your own email address** in the **From** field, you can simply **forward emails to yourself**.  
    
    You can control how the note is created using the following syntax:
    - **Set note title**  
      The email subject is used as the note title.
  
    - **Assign to a notebook**  
    Add `@notebook-name` to send the note to a specific notebook.

    - **Add tags**  
    Add `#tag-name` to attach tags to the note.

    - **Create a Todo note**  
      Start the subject with `!` to create a **Todo** instead of a regular note.


  #### 🧩 Example
  Suppose you want:
    - The note to be saved in the **joplin** and **email** notebooks
    - The note to be tagged with **gmail** and **email**
    - The note to be created as a **Todo**
  
  Email subject:
  `!My message @joplin @email #gmail #email`


  🎥 Demo:
  
    https://user-images.githubusercontent.com/58605547/188909511-479bff3b-bb9c-42da-9d48-a29d8b22fd4b.mp4

  #### If no notebook is specified, the note will be placed in the default **Email Messages** folder.

***

- ### 📂 Monitoring and Fetching from a Specific Mailbox

  1. Open the **Email Plugin**.
  2. Sign in with your email credentials.
  3. Select:
     - The mailbox you want to monitor
     - The notebook where notes should be created
  4. Enable **Fetching & Monitoring Mailbox**.

  All new or unread emails from the selected mailbox will be converted into notes automatically.

  Notes created from monitored mailboxes will automatically apply the following syntax (`#` for tags, `!` for Todos) without any additional steps.

***

- ### 📥 Uploading Downloaded Email Messages
  1. Open the **Email Plugin**.
  2. Click **Convert Saved Messages**.
  3. Upload email files in `.eml` format.
  4. Choose:
     - Target notebook
     - Tags
     - Export options
  5. Click **Convert** to create notes from the uploaded emails.


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
