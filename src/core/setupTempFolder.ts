import {tmpdir} from 'os';
import * as path from 'path';
import joplin from 'api';
const fs = joplin.require('fs-extra');


export class SetupTempFolder {
    static tempFolder = path.join(tmpdir(), 'joplin-email-plugin');

    static get tempFolderPath() {
        return SetupTempFolder.tempFolder;
    }

    static createTempFolder() {
        fs.mkdirSync(SetupTempFolder.tempFolder, {recursive: true});
    }

    static removeTempFolder() {
        fs.rmdirSync(SetupTempFolder.tempFolder, {recursive: true});
    }
}
