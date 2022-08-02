import {Login} from '../model/message.model';
import {emailProviders} from './emailProviders';
import {ImapConfig} from '../model/imapConfig.model';
import {EmailProvider} from 'src/model/emailProvider.model';

export function emailConfigure(login: Login): ImapConfig | undefined {
    let user = login.email;
    const password = login.password;

    user = user.toLocaleLowerCase();

    // Remove extra spaces from an email.
    user = user.replace(/\s+/g, '');


    const config: EmailProvider = emailProviders.find(({type}) => user.includes('@' + type));

    // In the case that the email provider is not present in the email providers list, it will be returned as "undefined".
    if (!config) {
        return undefined;
    }

    const imapConfig: ImapConfig = {
        user: user,
        password: password,
        ...config,
    };

    return imapConfig;
}
