import {Config} from 'imap';
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


export interface ManualConnectionScreen {
    manualConnectionScreen: boolean
}

// Type predicates
export function isManualConnectionScreen(message: any): message is ManualConnectionScreen {
    return 'manualConnectionScreen' in message;
}

export interface LoginScreen {
    loginScreen: boolean
}

// Type predicates
export function isLoginScreen(message: any): message is LoginScreen {
    return 'loginScreen' in message;
}

export interface LoginManually extends ImapConfig {
    loginManually: boolean,
}

// Type predicates
export function isLoginManually(message: any): message is LoginManually {
    return 'loginManually' in message && 'user' in message && 'password' in message &&
        'host' in message && 'port' in message && 'tls' in message;
}

export interface SearchByFrom {
    state: 'open' | 'close',
    from?: string
}

// Type predicates
export function isMonitorEmail(message: any): message is SearchByFrom {
    if (message.state === 'close') {
        return 'state' in message && 'from' in message;
    } else {
        return 'state' in message;
    }
}

export interface UploadMessagesScreen{
    uploadMessagesScreen: boolean,
}

// Type predicates
export function isUploadMessagesScreen(message: any): message is UploadMessagesScreen {
    return 'uploadMessagesScreen' in message;
}

export interface EMLtoNote{
    emlFiles: string[],
    folderId: string,
    tags: string[],
    exportType: 'HTML' | 'Markdown' | 'Text',
    includeAttachments: boolean,
    attachmentsStyle: 'Table' | 'Link',
}

// Type predicates
export function isUploadMessages(message: any): message is EMLtoNote {
    return 'emlFiles' in message && 'folderId' in message && 'tags' in message && 'exportType' in message && 'includeAttachments' in message && 'attachmentsStyle' in message;
}

export interface Logout{
    logout: boolean
}

// Type predicates
export function isLogout(message: any): message is Logout {
    return 'logout' in message;
}

export interface SelectAccount{
    account: Config
}

// Type predicates
export function isSelectAccount(message: any): message is SelectAccount {
    return 'account' in message;
}

export interface MonitorMailBox{
    monitorMailBox: boolean,
    mailbox?: string,
    folderId?: string,
}

// Type predicates
export function isMonitorMailBox(message: any): message is MonitorMailBox {
    return 'monitorMailBox' in message;
}

export interface RememberMe{
    rememberMe: boolean,

}

// Type predicates
export function isRemeberMe(message: any): message is RememberMe {
    return 'rememberMe' in message;
}

export type Message = Login | ManualConnectionScreen | Hide | LoginScreen | LoginManually | SearchByFrom | UploadMessagesScreen | EMLtoNote | Logout | SelectAccount | MonitorMailBox | RememberMe;
