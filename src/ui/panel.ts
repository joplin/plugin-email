import joplin from 'api';
import JoplinViewsPanels from 'api/JoplinViewsPanels';
import {Message, Login, isLogin, isHide, isManualConnectionScreen, isLoginScreen, isLoginManually, isMonitorEmail, SearchByFrom, isUploadMessagesScreen, isUploadMessages, EMLtoNote, isLogout, isSelectAccount, SelectAccount, isMonitorMailBox, MonitorMailBox, isRefresh} from '../model/message.model';
import {ImapConfig} from '../model/imapConfig.model';
import {emailConfigure} from '../core/emailConfigure';
import {IMAP} from '../core/imap';
import {PostNote} from '../core/postNote';
import EmailParser from '../core/emailParser';
import {EmailContent} from '../model/emailContent.model';
import {SetupTempFolder} from '../core/setupTempFolder';
import {ExportCriteria} from '../model/exportCriteria.model';
import {mainScreen, manualScreen, loginScreen, uploadMessagesScreen, loadingScreen} from './screens';
import {State} from '../model/state.model';
import {Config} from 'imap';
import {PostCriteria} from '../model/postCriteria.model';
import {ACCOUNTS, LAST_STATE} from '../constants';

export class Panel {
    panels: JoplinViewsPanels;
    view: string;
    visibility: boolean;
    account = null;
    defaultState: State = {accountConfig: null, from: '', isEmailMonitor: false, mailBox: null, mailBoxes: null, isMailBoxMonitor: false, folderId: null};
    lastState: State = {...this.defaultState};

    async setupPanel() {
        if (this.view) {
            await this.closeOpenPanel();
            return;
        }
        this.panels = joplin.views.panels;

        this.view = await this.panels.create('panel');

        // Bootstrap v5.1.3.
        await this.addScript('./ui/style/bootstrap.css');
        await this.addScript('./ui/style/style.css');

        // for tags input style
        await this.addScript('./ui/style/tagify.css');
        await this.addScript('./ui/style/tagify.js');

        await this.addScript('./ui/webview.js');

        // To get the last state before the user exits from Joplin.
        const state: State = await joplin.settings.value(LAST_STATE);

        if (state.accountConfig) {
            try {
                const htmlLoadingScreen = loadingScreen();
                await this.setHtml(htmlLoadingScreen);
                this.lastState = {...state};
                await this.login(this.lastState['accountConfig']);

                if (state.isEmailMonitor) {
                    this.account.setEmailMonitoring({
                        mailBox: 'inbox',
                        criteria: [['FROM', state.from], 'UNSEEN'],
                    });
                }
                if (state.isMailBoxMonitor) {
                    this.account.setMailBoxMonitoring({
                        mailBox: state.mailBox,
                        folderId: state.folderId,
                        criteria: ['ALL', 'UNSEEN'],
                    });
                }
                const htmlMainScreen = await mainScreen(this.lastState);
                await this.setHtml(htmlMainScreen);
            } catch (err) {
                alert(err);
                const htmlLoginScreen = await loginScreen();
                await this.setHtml(htmlLoginScreen);
                throw err;
            }
        } else {
            // display the login screen
            const htmlLoginScreen = await loginScreen();
            await this.setHtml(htmlLoginScreen);
        }
        await this.constructBridge();
    }

    async setHtml(html: string) {
        await this.panels.setHtml(this.view, html);
    }

    async addScript(path: string) {
        await this.panels.addScript(this.view, path);
    }

    async closeOpenPanel() {
        this.visibility = await joplin.views.panels.visible(this.view);
        await joplin.views.panels.show(this.view, !this.visibility);
    }
    // establishing a bridge between WebView and a plugin.
    async constructBridge() {
        await this.panels.onMessage(this.view, async (message: Message) => {
            this.bridge(message);
        });
    }

    async login(config: Config) {
        this.account = new IMAP(config);
        await this.account.init();
        this.account.view = this.view;
        this.account.monitor();
        const mailBoxes = await this.account.getBoxesPath();
        this.lastState['mailBoxes'] = mailBoxes;
        this.lastState['accountConfig'] = this.account.config;
        const htmlMainScreen = await mainScreen(this.lastState);
        await this.setHtml(htmlMainScreen);
        await joplin.settings.setValue(LAST_STATE, this.lastState);

        // to add or update account config
        const accoutns = await joplin.settings.value(ACCOUNTS);
        accoutns[this.account.email] = this.account.config;
        joplin.settings.setValue(ACCOUNTS, accoutns);
    }

    async bridge(message: Message) {
        if (isLoginScreen(message)) {
            // close old account connection if any.
            if (this.account) {
                this.account.close();
                this.account = null;
            }
            const htmlLoginScreen = await loginScreen();
            await this.setHtml(htmlLoginScreen);
        } else if (isLogin(message)) {
            try {
                // It will alert the user using the manual connection if it can't find an email provider in the email providers list.
                const imapConfig: ImapConfig = emailConfigure(message as Login);
                await this.login(imapConfig);
            } catch (err) {
                alert(err);
                throw err;
            } finally {
                this.panels.postMessage(this.view, 'enableLoginScreen');
            }
        } else if (isManualConnectionScreen(message)) {
            const htmlManualScreen = manualScreen();
            await this.setHtml(htmlManualScreen);
        } else if (isLoginManually(message)) {
            try {
                // close old account connection if any
                if (this.account) {
                    this.account.close();
                    this.account = null;
                }
                // If a connection is established, it will display the main screen and start monitoring waiting for any query.
                await this.login(message as ImapConfig);
            } catch (err) {
                alert(err);
                throw err;
            } finally {
                this.panels.postMessage(this.view, 'enableManualLoginScreen');
            }
        } else if (isMonitorEmail(message)) {
            const query: Message = message as SearchByFrom;

            if (query.state === 'close') {
                this.account.setEmailMonitoring({
                    mailBox: 'inbox',
                    criteria: [['FROM', query.from], 'UNSEEN'],
                });
                this.lastState['from'] = query.from;
                this.lastState['isEmailMonitor'] = true;

                const htmlMainScreen = await mainScreen(this.lastState);
                await this.setHtml(htmlMainScreen);
                await joplin.settings.setValue(LAST_STATE, this.lastState);
            } else {
                this.lastState['isEmailMonitor'] = false;
                this.account.setEmailMonitoring(null);

                const htmlMainScreen = await mainScreen(this.lastState);
                await this.setHtml(htmlMainScreen);
                await joplin.settings.setValue(LAST_STATE, this.lastState);
            }
        } else if (isMonitorMailBox(message)) {
            const query = message as MonitorMailBox;

            if (query.monitorMailBox) {
                this.account.setMailBoxMonitoring({
                    mailBox: query.mailbox,
                    criteria: ['ALL', 'UNSEEN'],
                    folderId: query.folderId,
                });

                this.lastState['isMailBoxMonitor'] = true;
                this.lastState['mailBox'] = query.mailbox;
                this.lastState['folderId'] = query.folderId;
                await joplin.settings.setValue(LAST_STATE, this.lastState);
                const htmlMainScreen = await mainScreen(this.lastState);
                await this.setHtml(htmlMainScreen);
            } else {
                this.account.setMailBoxMonitoring(null);

                this.lastState['isMailBoxMonitor'] = false;
                await joplin.settings.setValue(LAST_STATE, this.lastState);
                const htmlMainScreen = await mainScreen(this.lastState);
                await this.setHtml(htmlMainScreen);
            }
        } else if (isUploadMessagesScreen(message)) {
            const htmlUploadMessagesScreen = await uploadMessagesScreen();
            await this.setHtml(htmlUploadMessagesScreen);
        } else if (isUploadMessages(message)) {
            const {emlFiles, tags, folderId, exportType, includeAttachments, attachmentsStyle} = message as EMLtoNote;
            const exportCriteria: ExportCriteria = {exportType, includeAttachments, attachmentsStyle};
            try {
                const tempFolderPath = SetupTempFolder.tempFolderPath;
                SetupTempFolder.createTempFolder();

                for (let i = 0; i < emlFiles.length; i++) {
                    const parser = new EmailParser();
                    const emailContent:EmailContent = await parser.parse(emlFiles[i]);
                    const note = new PostNote();
                    const postCriteria: PostCriteria = {emailContent, exportCriteria, tempFolderPath, folderId, tags};
                    await note.post(postCriteria);
                }
            } catch (err) {
                alert(err);
                throw err;
            } finally {
                this.panels.postMessage(this.view, 'enableUploadEMLScreen');
                SetupTempFolder.removeTempFolder();
            }
        } else if (isSelectAccount(message)) {
            this.lastState = {...this.defaultState};
            const config = message as SelectAccount;
            this.account = new IMAP(config.account as ImapConfig);
            await this.account.init();
            const htmlMainScreen = await mainScreen(this.lastState);
            await this.setHtml(htmlMainScreen);
            await joplin.settings.setValue(LAST_STATE, this.lastState);
            this.account.monitor();
        } else if (isLogout(message)) {
            this.lastState = {...this.defaultState};
            this.account.close();
            this.account = null;
            const htmlLoginScreen = await loginScreen();
            await this.setHtml(htmlLoginScreen);
            await joplin.settings.setValue(LAST_STATE, this.lastState);
        } else if (isHide(message)) {
            await this.closeOpenPanel();
        } else if (isRefresh(message)) {
            try {
                await this.account.state();

                // refresh mailboxes
                const mailBoxes = await this.account.getBoxesPath();
                this.lastState['mailBoxes'] = mailBoxes;
                this.lastState['accountConfig'] = this.account.config;

                // refresh joplin notebooks
                const htmlMainScreen = await mainScreen(this.lastState);
                await this.setHtml(htmlMainScreen);
                await joplin.settings.setValue(LAST_STATE, this.lastState);
            } catch (err) {
                alert(err);
                throw err;
            }
        }
    }
}
