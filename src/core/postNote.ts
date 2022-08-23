import joplin from 'api';
import {Attachment} from '../model/attachment.model';
import {EmailContent} from '../model/emailContent.model';
import {EXPORT_TYPE} from '../constants';
import {Attachments} from './postAttachments';
import {ExportNote} from '../model/exportNote.model';
import {AttachmentProperties} from 'src/model/attachmentProperties.model';
import {Tag} from '../model/tag.model';

export class PostNote {
    emailHtmlBody: string;
    subject: string;
    tempFolderPath: string;
    attachments: Attachment[];
    folders: string[] = [];
    note: ExportNote = {title: '', parent_id: '', body: '', body_html: '', markup_language: 1};

    async createFolder(folder: string): Promise<void> {
        await joplin.data.post(['folders'], null, {title: folder});
    }

    async createTag(tag: string): Promise<Tag> {
        return await joplin.data.post(['tags'], null, {title: tag});
    }

    async addTags(tags: string[]): Promise<Tag[]> {
        let joplinTags : {items: Tag[], has_more: boolean};
        let page = 1;
        // copy of tags
        const tempTags = [...tags];
        const emailTags: Tag[] = [];

        do {
            joplinTags = await joplin.data.get(['tags'], {page: page++});

            for (let i = 0; i < joplinTags.items.length; i++) {
                const joplinTag: Tag = joplinTags.items[i];

                if (tempTags.includes(joplinTag.title)) {
                    emailTags.push(joplinTag);
                    const index = tempTags.indexOf(joplinTag.title);
                    tempTags.splice(index, 1);
                }
            }
        } while (joplinTags.has_more);

        for (let i = 0; i < tempTags.length; i++) {
            const tag: Tag = await this.createTag(tempTags[i]);
            emailTags.push(tag);
        }

        return emailTags;
    }

    async post(emailContent: EmailContent, tempFolderPath: string, folderId: string, tags: string []): Promise<void> {
        this.attachments = emailContent.attachments;
        this.subject = emailContent.subject;
        this.tempFolderPath = tempFolderPath;
        this.note['parent_id'] = folderId;

        // to get only the HTML body of the email and ignore unnecessary data.
        this.emailHtmlBody = new DOMParser().parseFromString(emailContent.html, 'text/html').body.innerHTML;

        // Converting email to (html, markdown, text) depends on what export type is in the plugin settings.
        await this.convert();

        const emailTags = await this.addTags(tags);

        // Post the note to Joplin.
        const note = await joplin.data.post(['notes'], null, this.note);

        // assign the tags for the note.
        for (let j = 0; j < emailTags.length; j++) {
            const tag = emailTags[j];
            await joplin.data.post(['tags', tag.id, 'notes'], null, {id: note.id});
        }
    }


    async convert() {
        const exportType = await joplin.settings.value(EXPORT_TYPE);
        if (exportType === 'HTML') {
            const postAttachments = new Attachments(this.attachments, this.tempFolderPath);
            const attachmentsProp: AttachmentProperties[] = await postAttachments.postAttachments();

            // Replace each attachment img src with the ID of the attachment location in Joplin resources.
            await this.addInlineAttachments(attachmentsProp);

            this.note['title'] = this.subject;
            this.note['body'] = this.emailHtmlBody;
            this.note['markup_language'] = 2;
        } else if (exportType === 'Markdown') {
            const postAttachments = new Attachments(this.attachments, this.tempFolderPath);
            const attachmentsProp: AttachmentProperties[] = await postAttachments.postAttachments();

            // Replace each attachment img src with the ID of the attachment location in Joplin resources.
            await this.addInlineAttachments(attachmentsProp);

            this.note['title'] = this.subject;
            this.note['body_html'] = this.emailHtmlBody;
        } else if (exportType === 'Text') {
            this.note['title'] = this.subject;

            const domParser = new DOMParser();
            const dom: Document = domParser.parseFromString(this.emailHtmlBody, 'text/html');
            const images = dom.getElementsByTagName('img');

            // Remove all images
            while (images.length > 0) {
                images[0].parentNode.removeChild(images[0]);
            }
            this.note['body_html'] = dom.body.innerHTML;
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

