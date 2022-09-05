import joplin from 'api';
import {State} from '../model/state.model';
import {ACCOUNTS} from '../constants';
import {JopinFolders} from '../model/joplinFolders.model';

export function loadingScreen() {
    return `
  <div class="container">
      <div class="row" style="font-size: large;">
          <div class="col-md-9 col-lg-7 col-xl-5 mx-auto">
              <div class="card border-0 shadow rounded-3 my-5" style="opacity: 0.97; top: 100px;">
                  <div class="d-flex justify-content-center">
                      <div class="spinner-border text-primary" role="status">
                          <span class="sr-only">Loading...</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `;
}

export async function loginScreen() {
    const accounts = await joplin.settings.value(ACCOUNTS);
    const options: string[] = [];
    let htmlAccounts = '';
    for (const key of Object.keys(accounts)) {
        const config = JSON.stringify( accounts[key]);
        const option = `<option value=${config}>${key}</option>`;
        options.push(option);
    }
    if (options.length) {
        htmlAccounts = `
      <div class="input-group mb-3">  
      <span class="input-group-text" id="basic-addon1"> Accounts </span>
      <select class="form-select" aria-label="Default select example" id = 'accounts'>
        ${options}
      </select>
      <button onclick="selectedAccount()" id = "selectedAccount" class="btn btn-outline-primary btn-login text-uppercase fw-bold" type="submit" style="font-size:large;">Login</button>
    </div>

    <hr class="my-4">
      `;
    }
    return `
<div class="container">

<div class="row" style="font-size: large;">

  <div class="col-md-9 col-lg-7 col-xl-5 mx-auto">

    <div class="card border-0 shadow rounded-3 my-3 align-middle d-flex justify-content-center" style="opacity: 0.97; top: 100px;" >

      <div class="card-body p-4 p-sm-5">

        <h1 class="card-title text-center mb-3 fw-light fs-1">Login</h1>

        <form action="" onsubmit="login(); return false">
          
          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="email" placeholder="name@example.com" required>
            <label for="floatingInput">Email address</label>
          </div>
          
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="password" placeholder="Password" onclick = "addBlockquote()"required>
            <label for="floatingPassword">Password</label>
          </div>

          <blockquote class="blockquote">
            <cite style = "font-size: 15px;" id = "quote"></cite>
          </blockquote>

          <div class="d-grid">
            <button id="login_btn" class="btn btn-outline-primary btn-login text-uppercase fw-bold" type="submit" style="font-size:large;">Login</button>
          </div>

        </form>

        <br>

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-info" style="width: 75%; font-size: large;" onclick="manualConnectionScreen()">Manually connect to IMAP</button>   
          <br>
          <br>
          <button type="button" class="btn btn-outline-success" style="width: 75%; font-size: large;" onclick="uploadMessagesScreen()">Convert Saved Messages</button>
        </div>

        <hr class="my-4">

        ${htmlAccounts}

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-danger" onclick="hide()">Close</button>
        </div>

      </div>
    </div>
  </div>
</div>
</div>
`;
};

export function manualScreen() {
    return `<div class="container">

<div class="row" style="font-size: large;">

  <div class="col-md-9 col-lg-7 col-xl-5 mx-auto">

  <div class="card border-0 shadow rounded-3 my-3 align-middle d-flex justify-content-center" style="opacity: 0.97; top: 100px;" >

      <div class="card-body p-4 p-sm-5">

        <h1 class="card-title text-center mb-3 fw-light fs-1">Login</h1>

        <form action="" onsubmit="loginManually(); return false">
          
          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="email" placeholder="name@example.com" required>
            <label for="floatingInput">Email address</label>
          </div>
          
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="password" placeholder="Password" onclick = "addBlockquote()" required>
            <label for="floatingPassword">Password</label>
          </div>

          <div class="input-group">
            <span class="input-group-text">Server</span>
            <input type="text" aria-label="First name" class="form-control" placeholder="imap.example.com"
              id="server" required>
          </div>

        <br>

        <div class="input-group">
          <span class="input-group-text">PORT</span>
          <input type="number" aria-label="First name" class="form-control" placeholder="993" min="1" id="port" required>
        </div>

        <br>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="ssl_tls" checked>
          <label class="form-check-label" for="ssl_tls">
            SSL/TLS
          </label>
        </div>

        <blockquote class="blockquote">
          <cite style = "font-size: 15px;" id = "quote"></cite>
        </blockquote>

          <div class="d-grid">
            <button id="login_btn" class="btn btn-outline-primary btn-login text-uppercase fw-bold" type="submit" style="font-size:large;">Login</button>
          </div>

        </form>

        <br>

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-info" style="width: 75%; font-size: large;"
            onclick="loginScreen()">Login Screen</button>
        </div>

        <hr class="my-4">

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-danger" onclick="hide()">Close</button>
        </div>

      </div>
    </div>
  </div>
</div>
</div>
`;
}

export async function mainScreen(lastState: State): Promise<string> {
    const fromValue = lastState['from'];
    let readOnly = '';
    let checked = '';
    let disabledFolders = '';
    let disabledMailBoxes = '';
    let checkedTogle = '';

    if (lastState['isEmailMonitor']) {
        readOnly = 'readOnly';
        checked = 'checked';
    }

    if (lastState['isMailBoxMonitor']) {
        disabledMailBoxes = 'disabled';
        disabledFolders = 'disabled';
        checkedTogle = 'checked';
    }

    let joplinFolders: JopinFolders;
    const folders = [];

    do {
        joplinFolders = await joplin.data.get(['folders']);

        for (let i = 0; i < joplinFolders.items.length; i++) {
            const folder = joplinFolders.items[i];
            let path = folder.title;
            let node = folder;
            const id = folder.id;

            // The parent folder path
            while (node.parent_id !== '') {
                node = await joplin.data.get(['folders', node.parent_id]);
                path = `${node.title}/${path}`;
            }
            folders.push({path: path, id: id});
        }
    } while (joplinFolders.has_more);

    const options = [];

    folders.forEach((folder) => {
        const option = lastState['folderId'] === folder.id ? `<option selected value="${folder.id}">${folder.path}</option>` : `<option value="${folder.id}">${folder.path}</option>`;
        options.push(option);
    });


    const mailBoxesOptions = [];
    lastState['mailBoxes'].forEach((element) => {
        const option = lastState['mailBox'] === element.path ? `<option selected value="${element.value}">${element.path}</option>`: `<option value="${element.value}">${element.path}</option>`;
        mailBoxesOptions.push(option);
    });


    return `
<div class="container">

<div class="row" style="font-size: large;">

  <div class="col-md-9 col-lg-7 col-xl-5 mx-auto">

  <div class="card border-0 shadow rounded-3 my-3 align-middle d-flex justify-content-center" style="opacity: 0.97; top: 100px;" >

      <div class="card-body p-4 p-sm-5">

        <button class="btn btn-primary input-group mb-3" style="width:20%; position:absolute; right:3px; top:3px" onclick="refresh()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>Refresh</button>    
        
        <h1 class="card-title text-center mb-3 fw-light fs-1">Main Screen</h1>

        <div class="container" style="text-align: center;">

          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">From</span>
            <input type="email" class="form-control" placeholder="email" aria-label="Email"
              aria-describedby="basic-addon1" id='from' value = "${fromValue}" ${readOnly} required>
              <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Enter your email and forward the messages to yourself after editing the subject or first line of email content by adding @ or # to locate the notes folder or add tags. Otherwise, the converted messages from a specific email account will be in the 'email messages' folder. In both cases, new or unread messages will only be fetched."><span ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg> </span></button>
          </div>
          <div class="container" style="text-align: center">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="toggle-from"
                onchange="toggle()" ${checked}>
              <label class="form-check-label" for="toggle-from">Fetching & Monitoring</label>
            </div>
          </div>
        </div>

        <br>

        <div class="container" style="text-align: center;">
          <div class="input-group mb-3">  
            <span class="input-group-text" id="basic-addon1">Mailbox</span>
            
            <select class="form-select" aria-label="Default select example" id = 'mailbox' ${disabledMailBoxes}>
              ${mailBoxesOptions}
            </select>
          </div>

        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Notebook</span>

          <select class="form-select" aria-label="Default select example" id = 'notebook' ${disabledFolders}>
            <option disabled selected value = "" >Select a notebook</option>
            ${options}
          </select>
        </div>

        <div class="container" style="text-align: center">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="toggle-box"
              onchange="toggleBox()" ${checkedTogle}>
            <label class="form-check-label" for="flexSwitchCheckChecked">Fetching & Monitoring MailBox</label>
          </div>
        </div>
        </div>
        
        <br>
        

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-info" style="width: 75%; font-size: large;"
            onclick="logout()">Logout</button>
        </div>

        <hr class="my-4">

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-danger" onclick="hide()">Close</button>
        </div>

      </div>
    </div>
  </div>
</div>
</div>
`;
}

export async function uploadMessagesScreen() {
    let joplinFolders: JopinFolders;
    const folders = [];

    do {
        joplinFolders = await joplin.data.get(['folders']);

        for (let i = 0; i < joplinFolders.items.length; i++) {
            const folder = joplinFolders.items[i];
            let path = folder.title;
            let node = folder;
            const id = folder.id;

            // The parent folder path
            while (node.parent_id !== '') {
                node = await joplin.data.get(['folders', node.parent_id]);
                path = `${node.title}/${path}`;
            }
            folders.push({path: path, id: id});
        }
    } while (joplinFolders.has_more);

    const options = [];

    folders.forEach((folder) => {
        const option = `<option value="${folder.id}">${folder.path}</option>`;
        options.push(option);
    });

    return `
<div class="container">

<div class="row" style="font-size: large;">

  <div class="col-md-9 col-lg-7 col-xl-5 mx-auto">

  <div class="card border-0 shadow rounded-3 my-3 align-middle d-flex justify-content-center" style="opacity: 0.97; top: 100px;" >

      <div class="card-body p-4 p-sm-5">

        <h1 class="card-title text-center mb-3 fw-light fs-1">Upload .eml Files</h1>

        <br>

        <div class="container" style="text-align: center;">

          <div class="mb-3">
            <input class="form-control" type="file" id="formFileMultiple" accept=".eml" multiple>
          </div>

          <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Notebook</span>

          <select class="form-select" aria-label="Default select example" id = 'notebook' onchange="createTag()">
            <option disabled selected value >Select a notebook</option>
            ${options}
          </select>
          
          </div>

          <div  class="input-group mb-3" id='div-tag'>

          </div>

          <div class="input-group mb-3">  
            <span class="input-group-text" id="basic-addon1"> Export Type </span>
            <select class="form-select" aria-label="Default select example" id = 'export_type'>
              <option value="HTML">HTML</option>;
              <option value="Markdown">Markdowm</option>;
              <option value="Text">Text</option>;
            </select>
          </div>

                  
          <div class="input-group mb-3">  
          <span class="input-group-text" id="basic-addon1"> Attachments Style </span>
          <select class="form-select" aria-label="Default select example" id = 'attachments_style'>
            <option value="Table">Table</option>;
            <option value="Link">Link</option>;
          </select>
        </div>


          <div class="container" style="text-align: center">
            <input class="form-check-input" type="checkbox" id="include_attachments" checked>
            <label class="form-check-label" for="include_attachments" style="padding-left: 5%;">
              Include Attachments
            </label>
          </div>

          <br>

          <button id="convert_btn" class="btn btn-outline-success btn-login text-uppercase fw-bold" type="submit"  onclick="uploadEMLfiles()" style="width: 75%; font-size:large;">Convert</button>

        </div>

        <br>

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-info" style="width: 75%; font-size: large;"
            onclick="loginScreen()">Login Screen</button>
        </div>

        <hr class="my-4">

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-danger" onclick="hide()">Close</button>
        </div>

      </div>
    </div>
  </div>
</div>
</div>
`;
}
