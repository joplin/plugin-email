import * as Imap from 'imap'
import { ImapConfig } from '../model/imapConfig.model';
import { Query } from '../model/Query.model';

export class IMAP {

    private imap = null;
    private monitorId = null;
    private query: Query = null;
    private delayTime = 1000 * 5;

    constructor(config: ImapConfig) {

        this.imap = new Imap({
            ...config,
            authTimeout: 10000,
            connTimeout: 30000,
            tlsOptions: {
                rejectUnauthorized: false
            },

        });
    }

    init() {
        return new Promise((resolve, reject) => {

            this.imap.connect();

            this.imap.once("ready", function () {
                console.log('%c---------------------  SUCCESSFUL IMAP CONNECTION  --------------------', 'color: Green');
                resolve(this.imap);
            });

            this.imap.once('error', function (err: Error) {
                reject(err);
            });
        });
    }

    setQuery(query: Query) {
        this.query = query;
    }

    openBox(mailBox, readOnly = true) {
        return new Promise((resolve, rejects) => {

            this.imap.openBox(mailBox, readOnly, (err, box) => {
                if (err) {
                    rejects(err);
                }
                else {
                    resolve(box);
                }
            });
        });
    }

    search(criteria) {
        return new Promise((resolve, rejects) => {
            this.imap.search(criteria, (err, messages) => {
                if (err) {
                    rejects(err);
                }
                else {
                    resolve(messages);
                }
            });
        });
    }

    state() {

        return new Promise((resolve, rejects) => {

            if (!navigator.onLine) {
                rejects('No internet Connection')
            }
            else if (!this.imap)
                rejects('Please Re-login')
            else if (this.imap.state == 'authenticated')
                resolve('authenticated');
            else {
                this.imap.connect().then(() => {
                    resolve('Reconnected successfully');
                }, (err: Error) => {
                    rejects(err);
                });
            }
        })
    }

    monitor() {

        let mailBox = null;
        let criteria = null;

        this.monitorId = setInterval(async () => {
            //  
            if (this.query) {

                ({ mailBox, criteria } = this.query);

                // Check if the connection is still stable.
                await this.state().then(async () => {

                    await this.openBox(mailBox).then(async () => {

                        await this.search(criteria).then((messages) => {
                            console.log(messages);
                        });
                    });

                }).catch((err) => {
                    alert(err);
                    // Revoke the query
                    this.query = null;
                });
            }

        }, this.delayTime);
    }

    close() {
        clearInterval(this.monitorId);
        this.imap.end();
        console.log('%c---------------------  Close IMAP CONNECTION  --------------------', 'color: Red');
    }

}