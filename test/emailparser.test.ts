globalThis.Blob = require('cross-blob');
import {Email} from 'postal-mime';
import EmailParser from '../src/core/emailParser';

it(`throw an error if the EML file is empty.`, async ()=>{
    const emailParser = new EmailParser();
    expect( async ()=> await emailParser.parse(emptyEML)).rejects.toThrow();
});


it(`The EML file starts with blank lines.`, async ()=>{
    const emailParser = new EmailParser();
    const emailContent: Email = await emailParser.parse(EMLStartsWithBlankLines);

    const subject = emailContent.subject;
    const HTML = emailContent.html;

    // valid email file
    expect(subject).toBe('test');
    expect(HTML).toBe('<div>Message</div>\n');
});

it(`The EML file ends with blank lines.`, async ()=>{
    const emailParser = new EmailParser();
    const emailContent: Email = await emailParser.parse(EMLEndsWithBlankLines);

    const subject = emailContent.subject;
    const HTML = emailContent.html;

    // valid email file
    expect(subject).toBe('test');
    expect(HTML).toBe('<div>Message</div>\n');
});


it(`'No Subject', If an email without a subject.`, async ()=>{
    const emailParser = new EmailParser();
    const emailContent: Email = await emailParser.parse(emailWithoutSubject);

    const subject = emailContent.subject;
    const HTML = emailContent.html;

    expect(subject).toBe('No Subject');
    expect(HTML).toBe('<div>Message</div>\n');
});


it(`email without body`, async ()=>{
    const emailParser = new EmailParser();
    const emailContent: Email = await emailParser.parse(emailWithoutBody);

    const subject = emailContent.subject;
    const HTML = emailContent.html;

    expect(subject).toBe('test');
    expect(HTML).toBe('<div><h1>This Email Has No Body</h1></div>\n');
});


/* EML examples */

const emptyEML = ``;
/* ------------------------------------------ */
const EMLStartsWithBlankLines = `


Subject: test
From: bishoy.magdy.adeeb@gmail.com
To: example@gmail.com
Content-Type: text/html; charset="UTF-8"

<div>Message</div>`;

/* ------------------------------------------ */

const EMLEndsWithBlankLines = `Subject: test
From: bishoy.magdy.adeeb@gmail.com
To: example@gmail.com
Content-Type: text/html; charset="UTF-8"

<div>Message</div>


`;

/* ------------------------------------------ */

const emailWithoutSubject = `Subject:  
From: bishoy.magdy.adeeb@gmail.com
To: example@gmail.com
Content-Type: text/html; charset="UTF-8"

<div>Message</div>`;

/* ------------------------------------------ */

const emailWithoutBody = `Subject: test
From: bishoy.magdy.adeeb@gmail.com
To: example@gmail.com`;
