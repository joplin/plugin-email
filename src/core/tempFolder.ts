import {tmpdir} from 'os';
import {sep} from 'path';
import joplin from 'api';
const fs = joplin.require('fs-extra');


export class TempFolder {
    tempFolder: string;
    constructor() {
        this.tempFolder = `${tmpdir}${sep}joplin-email-plugin${sep}`;
    }

    setupTempFolder() {
        try {
            fs.rmdirSync(this.tempFolder, {recursive: true});
            fs.mkdirSync(this.tempFolder, {recursive: true});
        } catch (err) {
            alert(err);
            throw err;
        }
    }
}
