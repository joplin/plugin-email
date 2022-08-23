import * as Imap from 'imap';
import {ImapConfig} from '../model/imapConfig.model';
import {Query} from '../model/Query.model';
import {SetupTempFolder} from './setupTempFolder';

export class IMAP {
    private imap: Imap = null;
    private monitorId = null;
    private query: Query = null;
    private delayTime = 1000 * 5;

    // To check if there is a query not completed yet.
    private pending = false;

    constructor(config: ImapConfig) {
        this.imap = new Imap({
            ...config,
            authTimeout: 10000,
            connTimeout: 30000,
            tlsOptions: {
                rejectUnauthorized: false,
            },

        });
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

    setQuery(query: Query) {
        this.query = query;
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
        let setupTempFolder: SetupTempFolder = null;
        this.monitorId = setInterval(async () => {
            if (this.query) {
                const {mailBox, criteria} = this.query;

                try {
                    // Check if the connection is still stable.
                    await this.state();

                    await this.openBox(mailBox);

                    const newMessages = await this.search(criteria);
                    console.log(newMessages, 'new Messages');

                    if (newMessages.length && !this.pending) {
                        this.pending = true;

                        setupTempFolder = new SetupTempFolder();
                        setupTempFolder.createTempFolder();

                        const data = await this.fetchAll(newMessages, {bodies: ''});
                        await this.markAsSeen(newMessages);
                        for (let i = 0; i < data.length; i++) {
                            // post email

                        }
                        setupTempFolder.removeTempFolder();
                        this.pending = false;
                    }
                } catch (err) {
                    // Revoke the query
                    this.query = null;
                    if (setupTempFolder) {
                        setupTempFolder.removeTempFolder();
                    }
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
