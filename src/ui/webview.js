/* eslint-disable no-unused-vars */

// When clicking on the 'login' button.
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    disabledLoginScreen(true);

    webviewApi.postMessage({
        login: true,
        email: email,
        password: password,
    });
}

// When clicking on the 'Manually connect to IMAP' button.
function manualConnectionScreen() {
    webviewApi.postMessage({
        manualConnectionScreen: true,
    });
}

// When clicking on the 'close' button.
function hide() {
    webviewApi.postMessage({
        hide: true,
    });
}

// When clicking on the 'login screen' button.
function loginScreen() {
    webviewApi.postMessage({
        loginScreen: true,
    });
}

// When clicking on the 'login' button on the manual screen.
function loginManually() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const server = document.getElementById('server').value.trim();
    const port = document.getElementById('port').value;
    const sslTls = document.getElementById('ssl_tls').checked;

    disabledManualLoginScreen(true);

    webviewApi.postMessage({
        loginManually: true,
        user: email,
        password: password,
        host: server,
        port: port,
        tls: sslTls,
    });
}

function toggle() {
    const from = document.getElementById('from').value;
    const readOnly = document.getElementById('from').readOnly;

    if (from.trim() === '' && !readOnly) {
        alert('Enter an email');
        document.getElementById('toggle-from').checked = false;
        return;
    }

    // It sends an email and then closes input.
    if (!readOnly) {
        webviewApi.postMessage({
            state: 'close',
            from: from,
        });
        document.getElementById('from').readOnly = !readOnly;
    } else {
        webviewApi.postMessage({
            state: 'open',
        });
        document.getElementById('from').readOnly = !readOnly;
    }
}

function uploadMessagesScreen() {
    webviewApi.postMessage({
        uploadMessagesScreen: true,
    });
}

function createTag() {
    const tagElement = document.getElementById('tags');
    if (tagElement) {
        return;
    }

    const divTag = document.getElementById('div-tag');

    const tag = document.createElement('input');
    tag.classList.add('form-control');
    tag.placeholder = 'Add a Tag...';
    tag.id = 'tags';

    divTag.appendChild(tag);
    new Tagify(tag);
}

async function readFile(file) {
    return new Promise((resolve, reject)=>{
        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = ()=>{
            resolve(reader.result);
        };

        reader.onerror = (err)=>{
            reject(err);
        };
    });
}

async function uploadEMLfiles() {
    const files = document.getElementById('formFileMultiple').files;
    const fileListLength = files.length;
    const folderId = document.getElementById('notebook').value;
    const tags = document.getElementById('tags');
    const includeAttachments = document.getElementById('include_attachments').checked;
    const exportType = document.getElementById('export_type').value;
    const attachmentsStyle = document.getElementById('attachments_style').value;

    disabledUploadEMLScreen(true);

    if (fileListLength === 0) {
        alert('Please upload .eml file(s)');
        disabledUploadEMLScreen(false);
        return;
    } else if (!tags) {
        /* If tags input is not created, that means the user has not selected a notebook yet. */
        alert('Please Choose a NoteBook');
        disabledUploadEMLScreen(false);
        return;
    }

    // convert an array of type string to an actual array.
    const tagsList = tags.value !== ''? JSON.parse(tags.value).map((e)=>e.value.toLowerCase()): [];
    const emlFiles = [];

    // for each eml file.
    for (let i = 0; i < fileListLength; i++) {
        const emlFile = await readFile(files[i]);
        emlFiles.push(emlFile);
    }

    webviewApi.postMessage({
        emlFiles: emlFiles,
        folderId: folderId,
        tags: tagsList,
        exportType: exportType,
        includeAttachments: includeAttachments,
        attachmentsStyle: attachmentsStyle,
    });
}

function logout() {
    webviewApi.postMessage({
        logout: true,
    });
}

function selectedAccount() {
    const accountsInput = document.getElementById('accounts');
    const account = accountsInput.value;
    const config = JSON.parse(account);

    disabledManualLoginScreen(true);

    webviewApi.postMessage({
        loginManually: true,
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        tls: config.tls,
    });
}

function toggleBox() {
    const mailbox = document.getElementById('mailbox').value;
    const readOnly = document.getElementById('mailbox').disabled;
    const folderId = document.getElementById('notebook').value;

    if (folderId === '') {
        /* If tags input is not created, that means the user has not selected a notebook yet. */
        alert('Please Choose a NoteBook');
        document.getElementById('toggle-box').checked = false;
        return;
    }
    // It sends an email and then closes input.
    if (!readOnly) {
        document.getElementById('mailbox').disabled = !readOnly;
        document.getElementById('notebook').disabled = !readOnly;

        webviewApi.postMessage({
            monitorMailBox: true,
            mailbox: mailbox,
            folderId: folderId,
        });
    } else {
        document.getElementById('mailbox').disabled = !readOnly;
        document.getElementById('notebook').disabled = !readOnly;

        webviewApi.postMessage({
            monitorMailBox: false,
        });
    }
}

function disabledLoginScreen(flag) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login_btn');
    if (flag === false) {
        emailInput.readOnly = passwordInput.readOnly = loginBtn.disabled = false;
        loginBtn.innerHTML = 'Login';
    } else {
        loginBtn.disabled = emailInput.readOnly = passwordInput.readOnly = true;
        const spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
        loginBtn.innerHTML = spinner;
    }
}

function disabledManualLoginScreen(flag) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const serverInput = document.getElementById('server');
    const portInput = document.getElementById('port');
    const sslTlsInput = document.getElementById('ssl_tls');
    const loginBtn = document.getElementById('login_btn');
    const selectedAccountBtn = document.getElementById('selectedAccount');

    if (flag === false) {
        if (selectedAccountBtn) {
            selectedAccountBtn.disabled = false;
            selectedAccountBtn.innerHTML = 'Login';
        } else {
            emailInput.readOnly = passwordInput.readOnly = serverInput.readOnly = portInput.readOnly = sslTlsInput.disabled = loginBtn.disabled = false;
            loginBtn.innerHTML = 'Login';
        }
    } else {
        if (selectedAccountBtn) {
            selectedAccountBtn.disabled = true;
            const spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
            selectedAccountBtn.innerHTML = spinner;
        } else {
            emailInput.readOnly = passwordInput.readOnly = serverInput.readOnly = portInput.readOnly = sslTlsInput.disabled = loginBtn.disabled = true;
            const spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
            loginBtn.innerHTML = spinner;
        }
    }
}

function disabledUploadEMLScreen(flag) {
    const filesInput = document.getElementById('formFileMultiple');
    const folderInput = document.getElementById('notebook');
    const tagsDiv = document.getElementById('div-tag');
    const includeAttachmentsInput = document.getElementById('include_attachments');
    const exportTypeInput = document.getElementById('export_type');
    const attachmentsStyleInput = document.getElementById('attachments_style');
    const loginBtn = document.getElementById('convert_btn');

    if (flag === false) {
        filesInput.disabled = folderInput.disabled = includeAttachmentsInput.disabled = exportTypeInput.disabled = attachmentsStyleInput.disabled = loginBtn.disabled = false;
        tagsDiv.style.pointerEvents = 'auto';
        loginBtn.innerHTML = 'Convert';
    } else {
        filesInput.disabled = folderInput.disabled = includeAttachmentsInput.disabled = exportTypeInput.disabled = attachmentsStyleInput.disabled = true;
        tagsDiv.style.pointerEvents = 'none';
        const spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
        loginBtn.disabled = true;
        loginBtn.innerHTML = spinner;
    }
}

webviewApi.onMessage(({message})=>{
    if (message === 'enableLoginScreen') {
        disabledLoginScreen(false);
    } else if (message === 'enableManualLoginScreen') {
        disabledManualLoginScreen(false);
    } else if (message === 'enableUploadEMLScreen') {
        disabledUploadEMLScreen(false);
    } else if (message === 'monitoringError') {
        webviewApi.postMessage({
            state: 'open',
        });
        webviewApi.postMessage({
            monitorMailBox: false,
        });
    }
});

function addBlockquote() {
    document.getElementById('quote').innerText = 'Make sure the email provider allows login using the original password; otherwise, use the app password.';
}

function refresh() {
    webviewApi.postMessage({
        refresh: false,
    });
}
