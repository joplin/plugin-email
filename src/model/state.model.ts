import {Config} from 'imap';

export interface State{
    accountConfig: Config,
    from: string,
    isEmailMonitor: boolean,
    isMailBoxMonitor: boolean,
    mailBox: string,
    mailBoxes: {path: string, value: string}[],
    folderId: string,
}
