import { EmailProvider } from "src/model/emailProvider.model";

export const emailProviders: EmailProvider[] = [

    {
        type: 'gmail',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'imap.gmail.com' }
    },

    {
        type: 'outlook',
        host: 'outlook.office365.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'outlook.office365.com' }
    },

    {
        type: 'icloud',
        host: 'imap.mail.me.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'imap.mail.me.com' }
    },

    {
        type: 'yahoo',
        host: 'imap.mail.yahoo.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'imap.mail.yahoo.com' }

    },

    {
        type: 'aol',
        host: 'imap.aol.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'imap.aol.com' }
    },

    {
        type: 'zoho',
        host: 'imap.zoho.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'imap.zoho.com' }
    },

    {
        type: 'yandex',
        host: 'imap.yandex.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'imap.yandex.com' }
    }

]