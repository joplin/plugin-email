import {tmpdir} from 'os';
import * as path from 'path';
import joplin from 'api';
import {Attachment} from '../model/attachment.model';
import {AttachmentProperties} from '../model/attachmentProperties.model';
const fs = joplin.require('fs-extra');

export class Attachments {
    tempFolder: string = path.join(tmpdir(), 'joplin-email-plugin');
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
                const filePath = path.join(tempFolder, this.attachments[i].filename);

                // to create a file
                fs.writeFileSync(filePath, Buffer.from(this.attachments[i].content));

                // To post a file to Joplin
                const resource = await joplin.data.post(
                    ['resources'],
                    null,
                    {title: filename}, // Resource metadata
                    [
                        {
                            path: filePath, // Actual file
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


