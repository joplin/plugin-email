import * as path from 'path';
import joplin from 'api';
import {AttachmentProperties} from '../model/attachmentProperties.model';
import {Attachment} from 'postal-mime';
const fs = joplin.require('fs-extra');

export class Attachments {
    tempFolderPath: string;
    attachments: Attachment[];

    constructor(attachments: Attachment[], tempFolderPath: string) {
        this.attachments = attachments.filter((e: Attachment)=>e.filename !== '');
        this.tempFolderPath = tempFolderPath;
    }


    async postAttachments(): Promise<AttachmentProperties[]> {
        const attachmentsProp: AttachmentProperties[] = [];
        const tempFolder = this.tempFolderPath;

        // for each attachment will create an actual file of the attachment and posting to Joplin.
        for (let i = 0; i < this.attachments.length; i++) {
            const {contentId, filename, mimeType} = this.attachments[i];
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
            attachmentsProp.push({contentId: contentId, id: resource.id, fileName: filename, mimeType: mimeType});
        }

        return attachmentsProp;
    }

    async postInlineAttachment(attachment: Attachment): Promise<AttachmentProperties> {
        const tempFolder = this.tempFolderPath;

        // Will create an actual file of the attachment and post it to Joplin.
        const {contentId, filename, mimeType, content} = attachment;
        const filePath = path.join(tempFolder, filename);

        // to create a file
        fs.writeFileSync(filePath, Buffer.from(content));

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

        return {contentId: contentId, id: resource.id, fileName: filename, mimeType: mimeType};
    }
}


