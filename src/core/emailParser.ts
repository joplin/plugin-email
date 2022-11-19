const postalMime = require('postal-mime/dist/node').postalMime.default;
import {EmailContent} from '../model/emailContent.model';


export default class EmailParser extends postalMime {
    emailContent: EmailContent;
    constructor() {
        super();
    }

    // Email in RFC 822 format.
    async parse(message: string): Promise<EmailContent> {
        // A message is invalid if it starts with a space.
        message = message.trim();

        this.emailContent = await super.parse(message);
        this.emailContent.subject = this.subject;
        this.emailContent.html = this.html;
        this.emailContent.attachments = this.emailContent.attachments;

        return (this.emailContent);
    }

    get subject() {
        return this.emailContent.subject || 'No Subject';
    }

    get html() {
        // If no html content is found, email text content will be returned if it exists. 
        if(!this.emailContent.html && this.emailContent.text){
            let message = '';
            const linebreaks = this.emailContent.text.split('\n');
            
            linebreaks.forEach(linebreak => {
                message += linebreak.trim() === ''? '<div><br\></div>':  `<div>${linebreak}</div>`;
            });
            return message;
        }
        return this.emailContent.html || '<div><h1>This Email Has No Body</h1></div>\n';
    }
}

