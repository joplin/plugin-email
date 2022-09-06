import joplin from 'api';
import * as Imap from 'imap';
import {ATTACHMENTS, ATTACHMENTS_STYLE, EXPORT_TYPE} from '../constants';
import {ExportCriteria} from '../model/exportCriteria.model';
import {PostCriteria} from '../model/postCriteria.model';
import {Query} from '../model/Query.model';
import EmailParser from './emailParser';
import {PostNote} from './postNote';
import {SetupTempFolder} from './setupTempFolder';

export class IMAP {
    private imap: Imap = null;
    private monitorId = null;
    private fromMonitoring: Query = null;
    private mailBoxMonitoring = null;
    private switcher = 1;
    private delayTime = 1000 * 60;
    private accountConfig: Imap.Config;

    // To check if there is a query not completed yet.
    private pending = false;
    view: string = '';

    constructor(config: Imap.Config) {
        this.accountConfig = {
            ...config,
            authTimeout: 10000,
            connTimeout: 30000,
            tlsOptions: {
                rejectUnauthorized: false,
            },

        };
        this.imap = new Imap(this.accountConfig);
    }

    get config() {
        return this.accountConfig;
    }

    get email() {
        return this.accountConfig.user;
    }

    init() {
        return new Promise<void>((resolve, reject) => {
            this.imap.connect();

            this.imap.once('ready', async ()=> {
                console.log('%c---------------------  SUCCESSFUL IMAP CONNECTION  --------------------', 'color: Green');
                resolve();
            });

            this.imap.once('error', function(err: Error) {
                reject(err);
            });
        });
    }

    setEmailMonitoring(query: Query) {
        this.fromMonitoring = query;
    }

    setMailBoxMonitoring(query: Query) {
        this.mailBoxMonitoring = query;
    }

    openBox(mailBox: string, readOnly = false) {
        return new Promise<void>((resolve, reject) => {
            this.imap.openBox(mailBox, readOnly, (err: Error, box: Imap.Box) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    search(criteria: any[]) {
        return new Promise<number[]>((resolve, reject) => {
            this.imap.search(criteria, (err: Error, uids: number[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(uids);
                }
            });
        });
    }

    state() {
        return new Promise<void>(async (resolve, reject) => {
            if (!navigator.onLine) {
                reject(new Error('No internet Connection'));
            } else if (!this.imap) {
                reject(new Error('Please Re-login'));
            } else if (this.imap.state === 'authenticated') {
                resolve();
            } else {
                try {
                    // Reconnecting
                    await this.init();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }
        });
    }

    fetchAll(messages: number[], options: Imap.FetchOptions) {
        return new Promise<string[]>((resolve, reject) => {
            const fetch = this.imap.fetch(messages, options);
            const convertedMessages: string[] = [];

            // For each message
            fetch.on('message', (message: Imap.ImapMessage, seqno: number) => {
                let data = '';

                message.on('body', (stream: NodeJS.ReadableStream) => {
                    stream.on('data', function(chunk: NodeJS.ReadableStream) {
                        // push data
                        data += chunk;
                    });
                });

                message.once('end', () => {
                    convertedMessages.push(data);
                });
            });

            // All messages have been fetched of type RFC 822.
            fetch.on('end', () => {
                resolve(convertedMessages);
            });

            this.imap.once('error', function(err: Error) {
                reject(err);
            });
        });
    }

    getBoxes() {
        return new Promise<Imap.MailBoxes>((resolve, reject)=>{
            this.imap.getBoxes((err, mailBoxes: Imap.MailBoxes)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(mailBoxes);
                }
            });
        });
    }

    getBoxesPath() {
        return new Promise<{path: string, value: string}[]>(async (resolve, reject)=>{
            const paths: {path: string, value: string}[] = [];
            const boxes = await this.getBoxes();

            const getPathes = (path: string, value: string, boxes: Imap.MailBoxes)=>{
                for (const box of Object.keys(boxes)) {
                    let newPath = path + box;
                    let newValue = value + box;
                    if (!boxes[box].attribs.includes('\\Noselect')) {
                        paths.push({value: newValue, path: newPath});
                    }

                    if (boxes[box].children) {
                        const children: Imap.MailBoxes = boxes[box].children;
                        newPath = newPath + '/';
                        newValue = newValue + boxes[box].delimiter;
                        getPathes(newPath, newValue, children);
                    }
                }
            };
            getPathes('', '', boxes);

            return resolve(paths);
        });
    }

    markAsSeen(messages: number[]) {
        return new Promise<void>(async (resolve, reject)=>{
            this.imap.addFlags(messages, ['SEEN'], (err)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    monitor() {
        const setupTempFolder: SetupTempFolder = null;
        this.monitorId = setInterval(async () => {
            if ((this.fromMonitoring || this.mailBoxMonitoring) && !this.pending) {
                const {mailBox, criteria, folderId} = this.switcher^1 && this.fromMonitoring ? this.fromMonitoring : this.mailBoxMonitoring || this.fromMonitoring;
                this.switcher ^= 1;

                try {
                    // Check if the connection is still stable.
                    await this.state();

                    await this.openBox(mailBox);

                    const newMessages = await this.search(criteria);
                    console.log(newMessages, 'new Messages');

                    if (newMessages.length && !this.pending) {
                        this.pending = true;

                        SetupTempFolder.createTempFolder();
                        const tempFolderPath = SetupTempFolder.tempFolderPath;

                        const data = await this.fetchAll(newMessages, {bodies: ''});

                        const includeAttachments = await joplin.settings.value(ATTACHMENTS);
                        const exportType = await joplin.settings.value(EXPORT_TYPE);
                        const attachmentsStyle = await joplin.settings.value(ATTACHMENTS_STYLE);
                        const exportCriteria: ExportCriteria = {includeAttachments, exportType, attachmentsStyle};

                        for (let i = 0; i < data.length; i++) {
                            // post email
                            const post = new PostNote();
                            const ep = new EmailParser();
                            const temp = await ep.parse(data[i]);
                            const postCriteria : PostCriteria = {
                                emailContent: temp,
                                tempFolderPath: tempFolderPath,
                                exportCriteria: exportCriteria,
                            };

                            if (folderId) {
                                postCriteria['folderId'] = folderId,
                                postCriteria['tags'] = [];
                            }

                            await post.post(postCriteria);
                        }

                        await this.markAsSeen(newMessages);

                        SetupTempFolder.removeTempFolder();
                        this.pending = false;
                    }
                } catch (err) {
                    // Revoke the query
                    this.mailBoxMonitoring = this.fromMonitoring = null;
                    this.pending = false;
                    if (setupTempFolder) {
                        SetupTempFolder.removeTempFolder();
                    }
                    joplin.views.panels.postMessage(this.view, 'monitoringError');
                    alert(err);
                    throw err;
                }
            }
        }, this.delayTime);
    }

    close() {
        clearInterval(this.monitorId);
        this.imap.end();
        console.log('%c---------------------  Close IMAP CONNECTION  --------------------', 'color: Red');
    }
}
