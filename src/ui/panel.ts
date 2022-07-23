import joplin from 'api';
import JoplinViewsPanels from 'api/JoplinViewsPanels';
import { Message, Login, isLogin, isHide, isManualConnection, isLoginScreen, isLoginManually, isSearchByFrom, SearchByFrom } from '../model/message.model'
import { ImapConfig } from '../model/imapConfig.model';
import { emailConfigure } from '../core/emailConfigure';
import { IMAP } from '../core/imap';


export class Panel {

  panels: JoplinViewsPanels;
  view: string;
  visibility: boolean
  account = null;
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
    await this.addScript('./ui/webview.js');

    // display the login screen
    await this.loginScreen();

    await this.constructBridge();

  }

  async setHtml(html: string) {
    await this.panels.setHtml(this.view, html);
  }

  async addScript(path: string) {
    await this.panels.addScript(this.view, path);
  }

  async loginScreen() {
    await this.setHtml(loginScreen)
  }

  async closeOpenPanel() {
    this.visibility = await joplin.views.panels.visible(this.view);
    await joplin.views.panels.show(this.view, !this.visibility);

  }
  // establishing a bridge between WebView and a plugin.
  async constructBridge() {
    await this.panels.onMessage(this.view, async (message: Message) => {
      this.bridge(message)
    });
  }

  async bridge(message: Message) {

    switch (message !== undefined) {
      // parsing email & start Imap eonnection
      case isLogin(message):
        const imapConfig: ImapConfig = emailConfigure(message as Login);

        // It will alert the user using the manual connection if it can't find an email provider in the email providers list.
        if (imapConfig) {
          this.account = new IMAP(imapConfig as ImapConfig);

          // If a connection is established, it will display the main screen and start monitoring waiting for any query.
          try {
            await this.account.init();
            this.setHtml(mainScreen);
            this.account.monitor();
          } catch (err) {
            alert(err);
            throw new Error(err);
          }

        } else {
          alert(`Sorry, an email provider couldn't be found, Please use the manual connection.`)
        }
        break;

      case isLoginManually(message):

        this.account = new IMAP(message as ImapConfig);

        // If a connection is established, it will display the main screen and start monitoring waiting for any query.
        try {
          await this.account.init();
          this.setHtml(mainScreen);
          this.account.monitor();
        } catch (err) {
          alert(err);
          throw new Error(err);
        }
        break;

      case isHide(message):
        this.closeOpenPanel();
        break;

      case isManualConnection(message):
        console.log('set Manual Screen');
        this.setHtml(manualScreen);
        break;

      case isLoginScreen(message):
        // close old account connection if any
        if (this.account)
          this.account.close(), this.account = null;

        this.loginScreen();
        break;

      case isSearchByFrom(message):
        let fromState: Message = message as SearchByFrom;

        if (fromState.state == 'close') {
          this.account.setQuery({
            mailBox: 'inbox',
            criteria: [['FROM', fromState.from]]
          });
        }
        else {
          this.account.setQuery(null);
        }
        break;
    }
  }

}


let loginScreen = `
<div class="container">

<div class="row" style="font-size: large;">

  <div class="col-md-9 col-lg-7 col-xl-5 mx-auto">

    <div class="card border-0 shadow rounded-3 my-5" style="opacity: 0.97; top: 100px;">

      <div class="card-body p-4 p-sm-5">

        <h1 class="card-title text-center mb-3 fw-light fs-1">Login</h1>

        <form action="" onsubmit="login(); return false">
          
          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="email" placeholder="name@example.com" required>
            <label for="floatingInput">Email address</label>
          </div>
          
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="password" placeholder="Password" required>
            <label for="floatingPassword">Password</label>
          </div>

          <div class="d-grid">
            <button id="btn" class="btn btn-outline-primary btn-login text-uppercase fw-bold" type="submit" style="font-size:large;">Login</button>
          </div>

        </form>

        <br>

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-info" style="width: 75%; font-size: large;" onclick="manualConnection()">Manually connect to IMAP</button>
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
`

let manualScreen = `
<div class="container">

<div class="row" style="font-size: large;">

  <div class="col-md-9 col-lg-7 col-xl-5 mx-auto">

    <div class="card border-0 shadow rounded-3 my-5" style="opacity: 0.97; top: 100px;">

      <div class="card-body p-4 p-sm-5">

        <h1 class="card-title text-center mb-3 fw-light fs-1">Login</h1>

        <form action="" onsubmit="loginManually(); return false">
          
          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="email" placeholder="name@example.com" required>
            <label for="floatingInput">Email address</label>
          </div>
          
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="password" placeholder="Password" required>
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

        <br>

          <div class="d-grid">
            <button id="btn" class="btn btn-outline-primary btn-login text-uppercase fw-bold" type="submit" style="font-size:large;">Login</button>
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
`
let mainScreen = `
<div class="container">

<div class="row" style="font-size: large;">

  <div class="col-md-9 col-lg-7 col-xl-5 mx-auto">

    <div class="card border-0 shadow rounded-3 my-5" style="opacity: 0.97; top: 100px;">

      <div class="card-body p-4 p-sm-5">

        <h1 class="card-title text-center mb-3 fw-light fs-1">Main Screen</h1>

        <div class="container" style="text-align: center;">

          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">From</span>
            <input type="email" class="form-control" placeholder="email" aria-label="Email"
              aria-describedby="basic-addon1" id='from' required>
          </div>
          <div class="container" style="text-align: center">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked"
                onchange="toggle()">
              <label class="form-check-label" for="flexSwitchCheckChecked">Fetching & Monitoring</label>
            </div>
          </div>
        </div>
        
        <br>

        <div class="container" style="text-align: center;">
          <button type="button" class="btn btn-outline-info" style="width: 75%; font-size: large;"
            onclick="loginScreen()">Logout</button>
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
`