import joplin from 'api';
import JoplinViewsPanels from 'api/JoplinViewsPanels';
import { Message } from '../model/message.model'


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
    switch (message.hide || message.login || message.manual_connection) {
      case message.login:
        // parsing email & start Imap eonnection
        console.log(message);
        break;
      case message.hide:
        this.closeOpenPanel();
        break;
      case message.manual_connection:
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