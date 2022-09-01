import {Config} from 'imap';

export interface State{
    accountConfig: Config,
    from: string,
    isFromMonitor: boolean,
    mailBox: string,
    mailBoxes: {path: string, value: string}[],
    isMailBoxMonitor: boolean,
    folderId: string,
}
