import joplin from 'api';
import {Attachment} from '../model/attachment.model';
import {EmailContent} from '../model/emailContent.model';
import {EXPORT_TYPE} from '../constants';
import {Attachments} from './postAttachments';
import {ExportNoteBody} from '../model/exportNoteBdoy.model';
import {AttachmentProperties} from 'src/model/attachmentProperties.mode';

export class PostNote {
    emailHtmlBody: string;
    subject: string;
    attachments: Attachment[];
    folders: string[] = [];
    tags: string[] = [];
    noteBody: ExportNoteBody = {title: '', parent_id: '', body: '', body_html: '', markup_language: 1};

    async createFolder(folder: string): Promise<void> {
        await joplin.data.post(['folders'], null, {title: folder});
    }

    async createTag(tag: string): Promise<void> {
        await joplin.data.post(['tags'], null, {title: tag});
    }

    async addFolders(folders: string[]): Promise<void> {
        this.folders = folders;
        const joplinFolders = await joplin.data.get(['folders']);

        // Search by folder title
        const joplinFoldersTitles = joplinFolders.items.map((joplinFolder)=> joplinFolder.title);

        const newFolders = folders.filter((folder)=> !joplinFoldersTitles.includes(folder));

        newFolders.forEach(async (folder)=>{
            await this.createFolder(folder);
        });
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

    async post(emailContent: EmailContent, folders: string[], tags: string []): Promise<void> {
        if (folders.length === 0) return;

        this.attachments = emailContent.attachments;
        this.subject = emailContent.subject;

        // to get only the HTML body of the email and ignore unnecessary data.
        this.emailHtmlBody = new DOMParser().parseFromString(emailContent.html, 'text/html').body.innerHTML;

        // Converting email to (html, markdown, text) depends on what export type is in the plugin settings.
        await this.converter();

        await this.addFolders(folders);
        await this.addTags(tags);

        const joplinFolders = await joplin.data.get(['folders']);
        const joplinTags = await joplin.data.get(['tags']);

        const emailFolders = joplinFolders.items.filter((e)=>{
            return this.folders.includes(e.title);
        });

        const emailTags = joplinTags.items.filter((e)=>{
            return this.tags.includes(e.title);
        });

        for (let i = 0; i < emailFolders.length; i++) {
            const folder = emailFolders[i];
            this.noteBody['parent_id'] = folder.id;

            const note = await joplin.data.post(['notes'], null, this.noteBody);

            for (let j= 0; j< emailTags.length; j++) {
                const tag = emailTags[j];
                await joplin.data.post(['tags', tag.id, 'notes'], null, {id: note.id});
            }
        }
    }


    async converter() {
        const exportType = await joplin.settings.value(EXPORT_TYPE);
        if (exportType === 'HTML') {
            const postAttachments = new Attachments(this.attachments);
            const attachmentsProp: AttachmentProperties[] = await postAttachments.postAttachments();

            // Replace each attachment img src with the ID of the attachment location in Joplin resources.
            await this.addInlineAttachments(attachmentsProp);

            this.noteBody['title'] = this.subject;
            this.noteBody['body'] = this.emailHtmlBody;
            this.noteBody['markup_language'] = 2;
        } else if (exportType === 'Markdown') {
            const postAttachments = new Attachments(this.attachments);
            const attachmentsProp: AttachmentProperties[] = await postAttachments.postAttachments();

            // Replace each attachment img src with the ID of the attachment location in Joplin resources.
            await this.addInlineAttachments(attachmentsProp);

            this.noteBody['title'] = this.subject;
            this.noteBody['body_html'] = this.emailHtmlBody;
        } else if (exportType === 'Text') {
            this.noteBody['title'] = this.subject;

            const domParser = new DOMParser();
            const dom: Document = domParser.parseFromString(this.emailHtmlBody, 'text/html');
            const images = dom.getElementsByTagName('img');

            // Remove all images
            while (images.length > 0) {
                images[0].parentNode.removeChild(images[0]);
            }
            this.noteBody['body_html'] = dom.body.innerHTML;
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

