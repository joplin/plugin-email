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
        return new Promise((resolve, reject) => {

            this.imap.openBox(mailBox, readOnly, (err, box) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(box);
                }
            });
        });
    }

    search(criteria) {
        return new Promise((resolve, reject) => {
            this.imap.search(criteria, (err, messages) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(messages);
                }
            });
        });
    }

    state() {

        return new Promise(async (resolve, reject) => {

            if (!navigator.onLine) {
                reject('No internet Connection')
            }
            else if (!this.imap)
                reject('Please Re-login')
            else if (this.imap.state == 'authenticated')
                resolve('authenticated');
            else {

                try {
                    await this.init();
                    resolve('Reconnected successfully');
                }
                catch (err) {
                    reject(err);
                }
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

                try {
                    // Check if the connection is still stable.
                    await this.state();

                    await this.openBox(mailBox);

                    let messages = await this.search(criteria);

                    console.log(messages);
                }
                catch (err) {
                    // Revoke the query
                    this.query = null;
                    alert(err);
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