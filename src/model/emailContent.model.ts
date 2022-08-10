import {Attachment} from './attachment.model';

/*
@headers is an array of headers in the same order as found from the message (topmost headers first).
    headers[].key is lowercase key of the header line, eg. "dkim-signature"
    heaers[].value is the unprocessed value of the header line

@from, @sender, @replyTo includes a processed object for the corresponding headers
    from.name is decoded name (empty string if not set)
    from.address is the email address

@deliveredTo, @returnPath is the email address from the corresponding header

@to, @cc, @bcc includes an array of processed objects for the corresponding headers
    to[].name is decoded name (empty string if not set)
    to[].address is the email address

@subject is the email subject line

@messageId, @inReplyTo, @references includes the value as found from the corresponding header without any processing

@date is the email sending time formatted as an ISO date string (unless parsing failed and in this case the original value is used)

@html is the HTML content of the message as a string

@text is the plaintext content of the message as a string

@attachments is an array that includes message attachments
*/


export interface EmailContent{

    headers: {
        key: string,
        value: string
    }[],

    from: {
        name: string,
        address: string,
    },

    sender: {
        name: string,
        address: string,
    },

    replyTo: {
        name: string,
        address: string,
    },

    deliveredTo: string,

    returnPath: string,

    to: {
        name: string,
        address: string,
    },

    cc: {
        name: string,
        address: string,
    },

    bcc: {
        name: string,
        address: string,
    },

    subject: string,

    messageId: string,

    inReplyTo: string,

    references: string,

    date: string,

    html: string,

    text: string,

    attachments: Attachment[],

}
