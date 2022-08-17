import joplin from 'api';
import {Attachment} from '../model/attachment.model';
import {EmailContent} from '../model/emailContent.model';
import {EXPORT_TYPE} from '../constants';
import {Attachments} from './postAttachments';
import {ExportNoteProp} from '../model/exportNoteProp.model';
import {AttachmentProperties} from 'src/model/attachmentProperties.model';

export class PostNote {
    emailHtmlBody: string;
    subject: string;
    attachments: Attachment[];
    folders: string[] = [];
    tags: string[] = [];
    noteProp: ExportNoteProp = {title: '', parent_id: '', body: '', body_html: '', markup_language: 1};

    async createFolder(folder: string): Promise<void> {
        await joplin.data.post(['folders'], null, {title: folder});
    }

    async createTag(tag: string): Promise<void> {
        await joplin.data.post(['tags'], null, {title: tag});
    }

    async addTags(tags: string[]): Promise<void> {
        this.tags = tags;
        const joplinTags = await joplin.data.get(['tags']);

        // Search by tag title
        const joplinTagsTitles = joplinTags.items.map((joplinTag)=> joplinTag.title);

        const newTags = tags.filter((tag)=> !joplinTagsTitles.includes(tag));

        newTags.forEach(async (tag)=>{
            await this.createTag(tag);
        });
    }

    async post(emailContent: EmailContent, folderId: string, tags: string []): Promise<void> {
        this.attachments = emailContent.attachments;
        this.subject = emailContent.subject;

        // to get only the HTML body of the email and ignore unnecessary data.
        this.emailHtmlBody = new DOMParser().parseFromString(emailContent.html, 'text/html').body.innerHTML;

        // Converting email to (html, markdown, text) depends on what export type is in the plugin settings.
        await this.convert();

        await this.addTags(tags);

        const joplinTags = await joplin.data.get(['tags']);

        const emailTags = joplinTags.items.filter((e)=>{
            return this.tags.includes(e.title);
        });

        this.noteProp['parent_id'] = folderId;
        const note = await joplin.data.post(['notes'], null, this.noteProp);

        // assign the tags for the note.
        for (let j = 0; j < emailTags.length; j++) {
            const tag = emailTags[j];
            await joplin.data.post(['tags', tag.id, 'notes'], null, {id: note.id});
        }
    }


    async convert() {
        const exportType = await joplin.settings.value(EXPORT_TYPE);
        if (exportType === 'HTML') {
            const postAttachments = new Attachments(this.attachments);
            const attachmentsProp: AttachmentProperties[] = await postAttachments.postAttachments();

            // Replace each attachment img src with the ID of the attachment location in Joplin resources.
            await this.addInlineAttachments(attachmentsProp);

            this.noteProp['title'] = this.subject;
            this.noteProp['body'] = this.emailHtmlBody;
            this.noteProp['markup_language'] = 2;
        } else if (exportType === 'Markdown') {
            const postAttachments = new Attachments(this.attachments);
            const attachmentsProp: AttachmentProperties[] = await postAttachments.postAttachments();

            // Replace each attachment img src with the ID of the attachment location in Joplin resources.
            await this.addInlineAttachments(attachmentsProp);

            this.noteProp['title'] = this.subject;
            this.noteProp['body_html'] = this.emailHtmlBody;
        } else if (exportType === 'Text') {
            this.noteProp['title'] = this.subject;

            const domParser = new DOMParser();
            const dom: Document = domParser.parseFromString(this.emailHtmlBody, 'text/html');
            const images = dom.getElementsByTagName('img');

            // Remove all images
            while (images.length > 0) {
                images[0].parentNode.removeChild(images[0]);
            }
            this.noteProp['body_html'] = dom.body.innerHTML;
        }
    }

    async addInlineAttachments(attachmentsProp: AttachmentProperties[]) {
        const domParser = new DOMParser();
        const dom: Document = domParser.parseFromString(this.emailHtmlBody, 'text/html');

        dom.body.querySelectorAll('img').forEach((img)=>{
            // replace with inline attachment.
            if (/^cid:/.test(img.src)) {
                const cid = img.src.substr(4).trim();
                const attachment = attachmentsProp.find((attachment)=>attachment.contentId && attachment.contentId === `<${cid}>`);
                if (attachment) {
                    img.src = `:/${attachment.id}`;
                }
            }
        });
        this.emailHtmlBody = dom.body.innerHTML;
    }
}

