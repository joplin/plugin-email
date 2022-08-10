import * as Imap from 'imap';
import {ImapConfig} from '../model/imapConfig.model';
import {Query} from '../model/Query.model';
import joplin from 'api';
import {CONVERTED_MESSAGES} from '../constants';
import {PostNote} from './postNote';
import EmailParser from './emailParser';
import {EmailContent} from '../model/emailContent.model';

export class IMAP {
    private imap = null;
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

            this.imap.once('ready', ()=> {
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

    openBox(mailBox, readOnly = true) {
        return new Promise<void>((resolve, reject) => {
            this.imap.openBox(mailBox, readOnly, (err, box) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    search(criteria): Promise<number[]> {
        return new Promise((resolve, reject) => {
            this.imap.search(criteria, (err, messages) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(messages);
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

    fetchAll(messages: number[], structure: object) {
        return new Promise<string[]>((resolve, reject) => {
            const fetch = this.imap.fetch(messages, structure);
            const convertedMessages: string[] = [];

            // For each message
            fetch.on('message', (message, seqno) => {
                let data = '';

                message.on('body', (stream) => {
                    stream.on('data', function(chunk) {
                        // push data
                        data += chunk;
                    });
                });

                message.once('end', async () => {
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

    newMessages(messages: number[]): Promise<number[]> {
        return new Promise(async (resolve, reject)=>{
            if (messages.length === 0) {
                return resolve([]);
            }

            try {
                const value = await joplin.settings.value(CONVERTED_MESSAGES);
                const email = this.imap._config.user;

                // Each email has a list of messages ids, which have been converted to notes before.
                if (!(email in value)) {
                    value[email] = {
                        ['from']: [],
                    };
                    await joplin.settings.setValue(CONVERTED_MESSAGES, value);
                }

                const converted = value[email]['from'];
                const newMessages = messages.filter((x) => !converted.includes(x));

                return resolve(newMessages);
            } catch (err) {
                return reject(err);
            }
        });
    }

    updateConvertedMessages(newMessages: number[]): Promise<void> {
        return new Promise(async (resolve, reject)=>{
            try {
                const value = await joplin.settings.value(CONVERTED_MESSAGES);
                const email = this.imap._config.user;

                value[email]['from'].push(...newMessages);
                await joplin.settings.setValue(CONVERTED_MESSAGES, value);
                resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    monitor() {
        let mailBox = null;
        let criteria = null;

        this.monitorId = setInterval(async () => {
            //
            if (this.query) {
                ({mailBox, criteria} = this.query);

                try {
                    // Check if the connection is still stable.
                    await this.state();

                    await this.openBox(mailBox);

                    const messages = await this.search(criteria);

                    const newMessages = await this.newMessages(messages);

                    console.log(newMessages);

                    if (newMessages.length && !this.pending) {
                        this.pending = true;
                        const data = await this.fetchAll(newMessages, {bodies: ''});

                        for (let i = 0; i < data.length; i++) {
                            const email = new EmailParser();
                            const emailContent: EmailContent = await email.parse(data[i]);

                            // for test
                            const note = new PostNote();
                            await note.post(emailContent, ['joplin'], []);
                        }
                        /* to save the id of converted messages */
                        await this.updateConvertedMessages(newMessages);
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
