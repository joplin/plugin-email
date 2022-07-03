import joplin from 'api';
import JoplinViewsPanels from 'api/JoplinViewsPanels';
import { Message, Login, isLogin, isHide, isManualConnection } from '../model/message.model'
import { ImapConfig } from 'src/model/imapConfig.model';
import { emailParser } from '../core/emailParser';


export class Panel {

  panels: JoplinViewsPanels;
  view: string;
  visibility: boolean

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
        const imapConfig: ImapConfig = emailParser(message as Login);

        // It will alert the user using the manual connection if it can't find an email provider in the email providers list.
        !imapConfig ? console.log('Alert the user using the manual screen.') : console.log('Passing the object to IMAP', imapConfig);
        break;
      case isHide(message):
        this.closeOpenPanel();
        break;
      case isManualConnection(message):
        console.log('set Manual Screen');
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