import {emailConfigure} from '../src/core/emailConfigure';
import {Login} from '../src/model/message.model';
import {ImapConfig} from '../src/model/imapConfig.model';


describe('Testing various types of writing the email', () => {
    it('Uppercase email', () => {
        const login: Login = {
            login: true,
            email: 'TEST@GMAIL.COM',
            password: '12345',
        };

        const config = emailConfigure(login);

        const answer: ImapConfig = {
            user: 'test@gmail.com',
            password: '12345',
            type: 'gmail',
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
        };

        expect(config).toStrictEqual(answer);
    });

    it('Email that starts with a space', () => {
        const login: Login = {
            login: true,
            email: '     test@gmail.com',
            password: '12345',
        };

        const config = emailConfigure(login);

        const answer: ImapConfig = {
            user: 'test@gmail.com',
            password: '12345',
            type: 'gmail',
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
        };

        expect(config).toStrictEqual(answer);
    });

    it('Email that ends with a space', () => {
        const login: Login = {
            login: true,
            email: 'test@outlook.com     ',
            password: '12345',
        };

        const config = emailConfigure(login);

        const answer: ImapConfig = {
            user: 'test@outlook.com',
            password: '12345',
            type: 'outlook',
            host: 'outlook.office365.com',
            port: 993,
            tls: true,
        };

        expect(config).toStrictEqual(answer);
    });

    it(`Presencing of a provider name from the provider's list within the username`, () => {
        const login: Login = {
            login: true,
            email: 'gmail@aol.com',
            password: '12345',
        };

        const config = emailConfigure(login);

        const answer: ImapConfig = {
            user: 'gmail@aol.com',
            password: '12345',
            type: 'aol',
            host: 'imap.aol.com',
            port: 993,
            tls: true,
        };

        expect(config).toStrictEqual(answer);
    });

    it('If a provider is not on the email provider list, it will throw an error.', () => {
        const login: Login = {
            login: true,
            email: 'test@company.com',
            password: '12345',
        };

        expect(()=>emailConfigure(login)).toThrow(Error(`Sorry, an email provider couldn't be found, Please use the manual connection.`));
    });
});
