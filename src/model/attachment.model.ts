/*
    @filename is the file name if provided
    @mimeType is the MIME type of the attachment
    @disposition is either "attachment", "inline" or null if disposition was not provided
    @related is a boolean value that indicats if this attachment should be treated as embedded image
    @contentId is the ID from Content-ID header
    @content is an ArrayBuffer that contains the attachment file
*/
export interface Attachment{

    filename: string | '',
    mimeType: string,
    disposition: 'attachment' | 'inline' | null,
    related: boolean,
    contentId: string,
    content: ArrayBuffer,
}
