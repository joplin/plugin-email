const postalMime = require('postal-mime/dist/node').postalMime.default;
import {Email} from 'postal-mime';
import StringOps from '../utils/stringOps';

export default class EmailParser extends postalMime {
    emailContent: Email;

    constructor() {
        super();
    }

    // Email in RFC 822 format.
    async parse(message: string): Promise<Email> {
        // A message is invalid if it starts with a space.
        message = message.trim();
        this.emailContent = await super.parse(message);
        this.emailContent.subject = this.getSubject();
        this.emailContent.html = this.getHTML();

        return (this.emailContent);
    }

    getSubject() {
        return this.emailContent.subject || 'No Subject';
    }

    getHTML() {
        const {html, text} = this.emailContent;
        const {escapeHTML} = StringOps;

        // If HTML content does not exist, email text content (wrapping with html) will be returned if it does.
        if (!html && text) {
            const linebreaks = text.split('\n');
            const splitText = (line: string) => (line.trim() === '' ? '<div><br\></div>' : `<div>${escapeHTML(line)}</div>`);
            const emailText = linebreaks.map(splitText).join('');

            return emailText;
        }

        return html || '<div><h1>This Email Has No Body</h1></div>\n';
    }
}
