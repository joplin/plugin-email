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


