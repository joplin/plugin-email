import {tmpdir} from 'os';
import * as path from 'path';
import joplin from 'api';
const fs = joplin.require('fs-extra');


export class SetupTempFolder {
    tempFolder: string;
    constructor() {
        this.tempFolder = path.join(tmpdir(), 'joplin-email-plugin');
    }

    get tempFolderPath() {
        return this.tempFolder;
    }

    createTempFolder() {
        fs.mkdirSync(this.tempFolder, {recursive: true});
    }

    removeTempFolder() {
        fs.rmdirSync(this.tempFolder, {recursive: true});
    }
}
