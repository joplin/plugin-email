// When clicking on the 'login' button.
function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    webviewApi.postMessage({
        login: true,
        email: email,
        password: password
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

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const server = document.getElementById("server").value;
    const ssl_tls = document.getElementById("ssl_tls").checked
    const port = document.getElementById("port").value;

    webviewApi.postMessage({
        login_manually: true,
        user: email,
        password: password,
        host: server,
        port: port,
        tls: ssl_tls,
    });
}

function toggle() {
    let from = document.getElementById('from').value;
    let readOnly = document.getElementById('from').readOnly;

    // It sends an email and then closes input.
    if (!readOnly) {
        webviewApi.postMessage({
            state: 'close',
            from: from
        });
        document.getElementById('from').readOnly = !readOnly;
    }
    else {
        webviewApi.postMessage({
            state: 'open',
        });
        document.getElementById('from').readOnly = !readOnly;
    }
}
