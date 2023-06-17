import joplin from 'api';
import {Attachments} from './postAttachments';
import {Note} from '../model/note.model';
import {AttachmentProperties} from 'src/model/attachmentProperties.model';
import {Tag} from '../model/tag.model';
import {ExportCriteria} from '../model/exportCriteria.model';
import {isPostByFolderId, isPostBySubject, PostCriteria} from '../model/postCriteria.model';
import {convert as htmlToText} from 'html-to-text';
import {Attachment} from 'postal-mime';
import EmailSubjectParser from './emailSubjectParser';

export class PostNote {
    emailHtmlBody: string;
    subject: string;
    tempFolderPath: string;
    attachments: Attachment[];
    folders: string[] = [];
    note: Note = {title: null, parent_id: null, body: null, is_todo: 0, body_html: null, markup_language: null};

    async createFolder(folder: string): Promise<void> {
        return await joplin.data.post(['folders'], null, {title: folder});
    }

    async createTag(tag: string): Promise<Tag> {
        return await joplin.data.post(['tags'], null, {title: tag});
    }

    async addFolders(folders: string[]): Promise<any[]> {
        let joplinFolders : {items: any[], has_more: boolean};
        let page = 1;
        // copy of tags
        const tempFolders = [...folders];
        const emailFolders: any[] = [];

        do {
            joplinFolders = await joplin.data.get(['folders'], {page: page++});

            for (let i = 0; i < joplinFolders.items.length; i++) {
                const joplinFolder: any = joplinFolders.items[i];

                if (tempFolders.includes(joplinFolder.title)) {
                    emailFolders.push(joplinFolder);
                    const index = tempFolders.indexOf(joplinFolder.title);
                    tempFolders.splice(index, 1);
                }
            }
        } while (joplinFolders.has_more);

        for (let i = 0; i < tempFolders.length; i++) {
            const folder: any = await this.createFolder(tempFolders[i]);
            emailFolders.push(folder);
        }
        return emailFolders;
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

    async post(postCriteria: PostCriteria): Promise<void> {
        this.attachments = postCriteria['emailContent'].attachments;
        this.subject = postCriteria['emailContent'].subject;
        this.emailHtmlBody = postCriteria['emailContent'].html;
        this.tempFolderPath = postCriteria['tempFolderPath'];
        let emailTags = [];
        let emailFolders = [];

        // Converting email to (html, markdown, text) depends on what export type is in the plugin settings.
        await this.convert(postCriteria['exportCriteria']);

        if (isPostByFolderId(postCriteria)) {
            this.note['parent_id'] = postCriteria['folderId'];
            const subject = postCriteria['emailContent'].subject;
            const emailText = htmlToText(this.emailHtmlBody, {wordwrap: 130, selectors: [{selector: 'img', format: 'skip'}]});
            const firstLine = (emailText || '').trim().split('\n')[0];
            const emailSubjectParser = new EmailSubjectParser(subject + ' ' + firstLine);
            const {tags, isTodo} = emailSubjectParser.parse();
            this.note['is_todo'] = isTodo;

            emailTags = await this.addTags([...tags, ...postCriteria['tags']]);

            // Post the note to Joplin.
            const note = await joplin.data.post(['notes'], null, this.note);

            // assign the tags for the note.
            for (let j = 0; j < emailTags.length; j++) {
                const tag = emailTags[j];
                await joplin.data.post(['tags', tag.id, 'notes'], null, {id: note.id});
            }
        } else if (isPostBySubject(postCriteria)) {
            const subject = postCriteria['emailContent'].subject;
            const emailText = htmlToText(this.emailHtmlBody, {wordwrap: 130, selectors: [{selector: 'img', format: 'skip'}]});
            const firstLine = (emailText || '').trim().split('\n')[0];
            const emailSubjectParser = new EmailSubjectParser(subject + ' ' + firstLine);
            const {folders, tags, isTodo} = emailSubjectParser.parse();
            this.note['is_todo'] = isTodo;

            emailTags = await this.addTags(tags);
            emailFolders = await this.addFolders(folders);

            for (let i = 0; i < emailFolders.length; i++) {
                this.note['parent_id'] = emailFolders[i].id;
                const note = await joplin.data.post(['notes'], null, this.note);

                for (let j = 0; j < emailTags.length; j++) {
                    const tag = emailTags[j];
                    await joplin.data.post(['tags', tag.id, 'notes'], null, {id: note.id});
                }
            }
        }
    }

    async convert(exportNote: ExportCriteria): Promise<void> {
        // to get only the HTML body of the email and ignore unnecessary data.
        this.emailHtmlBody = new DOMParser().parseFromString(this.emailHtmlBody, 'text/html').body.innerHTML;

        const attachmentsLinks = exportNote['includeAttachments']? await this.addAttachments(exportNote['attachmentsStyle']): '';
        const {exportType} = exportNote;

        if (exportType === 'HTML') {
            // Replace each attachment img src with the ID of the attachment location in Joplin resources.
            await this.addInlineImages();

            this.note['title'] = this.subject;
            this.note['body'] = this.emailHtmlBody + attachmentsLinks;
            this.note['markup_language'] = 2;
        } else if (exportType === 'Markdown') {
            // Replace each attachment img src with the ID of the attachment location in Joplin resources.
            await this.addInlineImages();

            this.note['title'] = this.subject;
            this.note['body_html'] = this.emailHtmlBody + attachmentsLinks;
            this.note['markup_language'] = 1;
        } else if (exportType === 'Text') {
            this.note['title'] = this.subject;

            const domParser = new DOMParser();
            const dom: Document = domParser.parseFromString(this.emailHtmlBody, 'text/html');
            const images = dom.getElementsByTagName('img');

            // Remove all images
            while (images.length > 0) {
                images[0].parentNode.removeChild(images[0]);
            }

            const htmlToText = dom.body.innerHTML
                .replace(/<\/?(table|tr|td|th)\b[^>]*>/gi, '\n\n')
                .replace(/\r?\n/g, '\u0001')

                // convert linebreak placeholders back to newlines
                .replace(/\u0001/g, '\n');

            this.note['body_html'] = htmlToText + attachmentsLinks;
            this.note['markup_language'] = 1;
        }
    }

    async addInlineImages(): Promise<void> {
        const domParser = new DOMParser();
        const dom: Document = domParser.parseFromString(this.emailHtmlBody, 'text/html');
        const imgs = dom.body.querySelectorAll('img');
        const postAttachments = new Attachments(this.attachments, this.tempFolderPath);

        for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i];

            // replace with inline attachment.
            if (/^cid:/.test(img.src)) {
                const cid = img.src.substr(4).trim();
                const attachment = this.attachments.find((attachment)=>attachment.contentId && attachment.contentId === `<${cid}>`);

                if (attachment) {
                    const resource = await postAttachments.postInlineAttachment(attachment);
                    img.src = `:/${resource.id}`;
                }
            }
        };
        this.emailHtmlBody = dom.body.innerHTML;
    }

    async addAttachments(attachmentsStyle: 'Table' | 'Link'): Promise<string> {
        const postAttachments = new Attachments(this.attachments, this.tempFolderPath);
        const attachmentsProp: AttachmentProperties[] = await postAttachments.postAttachments();

        let attachments: string ='';
        let attachmentsLinks: string = '';

        if (attachmentsStyle === 'Link') {
            attachmentsProp.forEach((att)=>{
                const link = `<a href = ":/${att.id}">${att.fileName} </a> <br>`;
                attachments += link;
            });
            attachmentsLinks = attachments !== ''? `<h2>Attachments</h2>${attachments}` : '';
        } else {
            attachmentsProp.forEach((att)=>{
                if (att.mimeType.startsWith('image/')) {
                    const link = `<tr><td>${att.fileName}</td><td> <img src=":/${att.id}" alt = "${att.fileName}" style="max-width:100%; max-height:100%;"> </td></tr>`;
                    attachments+= link;
                } else {
                    const link =`<tr><td>${att.fileName}</td><td> <a href=":/${att.id}">${att.fileName}</a> </td></tr>`;
                    attachments+= link;
                }
            });
            attachmentsLinks = attachments !== ''? `<h2>Attachments</h2><table style = "width:100%;"><tr><th>Filename</th><th>Link</th></tr>${attachments}</table>`: '';
        }
        return attachmentsLinks;
    }
}
