import {ImapConfig} from './imapConfig.model';

export interface Login {
    login: true,
    email: string,
    password: string
}

// Type predicates
export function isLogin(message: any): message is Login {
    return 'login' in message && 'email' in message && 'password' in message;
}

export interface Hide {
    hide: boolean
}

// Type predicates
export function isHide(message: any): message is Hide {
    return 'hide' in message;
}


export interface ManualConnection {
    manual_connection: boolean
}

// Type predicates
export function isManualConnection(message: any): message is ManualConnection {
    return 'manual_connection' in message;
}

export interface LoginScreen {
    login_screen: boolean
}

// Type predicates
export function isLoginScreen(message: any): message is LoginScreen {
    return 'login_screen' in message;
}

export interface LoginManually extends ImapConfig {
    login_manually: boolean,
}

// Type predicates
export function isLoginManually(message: any): message is LoginManually {
    return 'login_manually' in message && 'user' in message && 'password' in message &&
        'host' in message && 'port' in message && 'tls' in message;
}

export interface SearchByFrom {
    state: 'open' | 'close',
    from?: string
}

// Type predicates
export function isSearchByFrom(message: any): message is SearchByFrom {
    if (message.state === 'close') {
        return 'state' in message && 'from' in message;
    } else {
        return 'state' in message;
    }
}

export interface UploadMessages{
    upload_messages: boolean,
}

// Type predicates
export function isUploadMessages(message: any): message is UploadMessages {
    return 'upload_messages' in message;
}

export interface EMLtoNote{
    eml: string,
    notebook: string[],
    tags: string[],
}

// Type predicates
export function isEMLtoNote(message: any): message is EMLtoNote {
    return 'eml' in message && 'notebook' in message && 'tags' in message;
}

export type Message = Login | ManualConnection | Hide | LoginScreen | LoginManually | SearchByFrom | UploadMessages | EMLtoNote;
