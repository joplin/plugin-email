import * as Imap from 'imap';
import {ImapConfig} from '../model/imapConfig.model';
import {Query} from '../model/Query.model';
import joplin from 'api';
import {CONVERTED_MESSAGES} from '../constants';

export class IMAP {
    private imap: Imap = null;
    private monitorId = null;
    private query: Query = null;
    private delayTime = 1000 * 5;
    private user: string;

    // Stores converted messages id.
    private uids: number[] = [];

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
        this.user = config.user;
    }

    init() {
        return new Promise<void>((resolve, reject) => {
            this.imap.connect();

            this.imap.once('ready', async ()=> {
                console.log('%c---------------------  SUCCESSFUL IMAP CONNECTION  --------------------', 'color: Green');

                const value = await joplin.settings.value(CONVERTED_MESSAGES);
                const email = this.user;

                if (!(email in value)) {
                    value[email] = {
                        ['from']: [],
                    };
                    await joplin.settings.setValue(CONVERTED_MESSAGES, value);
                }

                // get the last converted messages id.
                this.uids = value[email]['from'];
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

    openBox(mailBox: string, readOnly = true) {
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


    updateConvertedMessages(newMessages: number[]) {
        return new Promise<void>(async (resolve, reject)=>{
            try {
                const value = await joplin.settings.value(CONVERTED_MESSAGES);
                const email = this.user;

                value[email]['from'].push(...newMessages);
                await joplin.settings.setValue(CONVERTED_MESSAGES, value);
                resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    monitor() {
        this.monitorId = setInterval(async () => {
            if (this.query) {
                const {mailBox, criteria} = this.query;

                try {
                    // Check if the connection is still stable.
                    await this.state();

                    await this.openBox(mailBox);

                    const messages = await this.search(criteria);
                    const newMessages : number[] = messages.filter((m) => ! this.uids.includes(m));

                    console.log(newMessages, 'new Messages');

                    if (newMessages.length && !this.pending) {
                        this.pending = true;
                        const data = await this.fetchAll(newMessages, {bodies: ''});

                        for (let i = 0; i < data.length; i++) {
                            // post email

                        }
                        // to save the id of converted messages.
                        await this.updateConvertedMessages(newMessages);
                        this.uids.push(...newMessages);

                        this.pending = false;
                    }
                } catch (err) {
                    // Revoke the query
                    this.query = null;
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
