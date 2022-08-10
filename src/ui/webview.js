/* eslint-disable no-unused-vars */

// When clicking on the 'login' button.
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    webviewApi.postMessage({
        login: true,
        email: email,
        password: password,
    });
}

// When clicking on the 'Manually connect to IMAP' button.
function manualConnection() {
    webviewApi.postMessage({
        manual_connection: true,
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
        login_screen: true,
    });
}

// When clicking on the 'login' button on the manual screen.
function loginManually() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const server = document.getElementById('server').value;
    const sslTls = document.getElementById('ssl_tls').checked;
    const port = document.getElementById('port').value;

    webviewApi.postMessage({
        login_manually: true,
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

function uploadMessages() {
    webviewApi.postMessage({
        upload_messages: true,
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

function uploadEMLfiles() {
    const files = document.getElementById('formFileMultiple').files;
    const fileListLength = files.length;
    const notebook = document.getElementById('notebook').value;
    const tags = document.getElementById('tags');

    if (fileListLength === 0) {
        alert('Please upload .eml file(s)');
        return;
    } else if (!tags) {
        /* If tags input is not created, that means the user has not selected a notebook yet. */
        alert('Please Choose a NoteBook');
        return;
    }

    // convert an array of type string to an actual array.
    const tagsList = tags.value !== ''? JSON.parse(tags.value).map((e)=>e.value.toLowerCase()): [];

    // for each eml file.
    for (let i = 0; i < fileListLength; i++) {
        const reader = new FileReader();
        reader.readAsText(files[i]);

        // for each loaded eml file.
        reader.onload = ()=>{
            webviewApi.postMessage({
                eml: reader.result,
                notebook: [notebook],
                tags: tagsList,
            });
        };
    }
}
