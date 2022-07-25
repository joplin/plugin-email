import {EmailProvider} from '../model/emailProvider.model';

export const emailProviders: EmailProvider[] = [

    {
        type: 'gmail',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
    },

    {
        type: 'outlook',
        host: 'outlook.office365.com',
        port: 993,
        tls: true,
    },

    {
        type: 'icloud',
        host: 'imap.mail.me.com',
        port: 993,
        tls: true,
    },

    {
        type: 'yahoo',
        host: 'imap.mail.yahoo.com',
        port: 993,
        tls: true,
    },

    {
        type: 'aol',
        host: 'imap.aol.com',
        port: 993,
        tls: true,
    },

    {
        type: 'zoho',
        host: 'imap.zoho.com',
        port: 993,
        tls: true,
    },

    {
        type: 'yandex',
        host: 'imap.yandex.com',
        port: 993,
        tls: true,
    },

];
