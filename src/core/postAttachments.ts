import {tmpdir} from 'os';
import {sep} from 'path';
import joplin from 'api';
import {Attachment} from '../model/attachment.model';
import {AttachmentProperties} from '../model/attachmentProperties.mode';
const fs = joplin.require('fs-extra');

export class Attachments {
    tempFolder: string = `${tmpdir}${sep}joplin-email-plugin${sep}`;
    attachments: Attachment[];

    constructor(attachments: Attachment[]) {
        this.attachments = attachments.filter((e: Attachment)=>e.filename !== '');
    }


    async postAttachments(): Promise<AttachmentProperties[]> {
        const attachmentsProp: AttachmentProperties[] = [];
        const tempFolder = this.tempFolder;

        try {
            // for each attachment will create an actual file of the attachment and posting to Joplin.
            for (let i = 0; i < this.attachments.length; i++) {
                const {contentId, filename} = this.attachments[i];
                const path = `${tempFolder}${this.attachments[i].filename}`;

                // to create a file
                fs.writeFileSync(path, Buffer.from(this.attachments[i].content));

                // To post a file to Joplin
                const resource = await joplin.data.post(
                    ['resources'],
                    null,
                    {title: filename}, // Resource metadata
                    [
                        {
                            path: path, // Actual file
                        },
                    ],
                );

                attachmentsProp.push({contentId: contentId, id: resource.id});
            }

            return attachmentsProp;
        } catch (err) {
            throw err;
        }
    }
}


