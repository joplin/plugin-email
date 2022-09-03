// This regexs from https://github.com/regexhq/mentions-regex/blob/master/index.js
// @folder regex Regular expression for matching @foldre mentions
const mentionPattern = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:﹫|@|＠)(?!\/))([a-zA-Z0-9/_.]{1,50})(?:\b(?!﹫|@|＠|#|⋕|♯|⌗)|$)/g;

// #tag regex Regular expression for matching #tag mentions
const tagPattern = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:#|⋕|♯|⌗)(?!\/))([a-zA-Z0-9/_.]{1,50})(?:\b(?!﹫|@|＠|#|⋕|♯|⌗)|$)/g;

let keys: string[] = [];
let nextKey = 0;

// Generates (a-z, A-z)(0-9) = 26 * 10 * 2 unique keys for each character to convert the subject to (a-z, A-Z, 0-9) and apply regex on it.
function generateKeys() {
    keys = [];
    nextKey = 0;

    for (let c = 'A'.charCodeAt(0); c <= 'Z'.charCodeAt(0); c++) {
        for (let i = 0; i < 10; i++) {
            const key = String.fromCharCode(c) + i.toString();
            keys.push(key);
        }
    }

    for (let c = 'a'.charCodeAt(0); c <= 'z'.charCodeAt(0); c++) {
        for (let i = 0; i < 10; i++) {
            const key = String.fromCharCode(c) + i.toString();
            keys.push(key);
        }
    }
}

function emailFolders(s: string) {
    const alphaKey = new Map();
    const alphaIndex = new Map();
    const mentionSymbol = ['@', '＠', '﹫'];

    let target = '';
    const folders: string[] =[];

    for (let i = 0; i < s.length; i++) {
        if (mentionSymbol.includes(s[i])) {
            // Assign a key to each character in the string to be able to run the regex on different languages and Unicode characters.
            alphaKey.set(s[i], s[i]);
            alphaIndex.set(s[i], s[i]);
            target += s[i];
        } else if (s[i]=== ' ') {
            target += ' ';
        } else if (alphaKey.has(s[i])) {
            target += alphaKey.get(s[i]);
        } else {
            alphaKey.set(s[i], keys[nextKey]);
            alphaIndex.set(keys[nextKey], s[i]);
            target += keys[nextKey];
            nextKey++;
        }
    }

    let m;

    // to extract all matches from the string.
    while (m = mentionPattern.exec(target)) {
        let ans = '';
        let key = '';
        for (let i = 0; i < m[1].length; i += 2) {
            key = m[1].substr(i, 2);

            // Return the original character from the string
            const mKey = alphaIndex.get(key);
            ans += mKey;
        }
        folders.push(ans);
    }

    return folders;
}

function emailTags(s: string) {
    const alphaKey = new Map();
    const alphaIndex = new Map();
    const tagsSymbol = ['#', '♯', '⌗', '⋕'];

    let target = '';
    const tags: string[] =[];

    for (let i = 0; i < s.length; i++) {
        if (tagsSymbol.includes(s[i])) {
            // Assign a key to each character in the string to be able to run the regex on different languages and Unicode characters.
            alphaKey.set(s[i], s[i]);
            alphaIndex.set(s[i], s[i]);
            target += s[i];
        } else if (s[i]=== ' ') {
            target += ' ';
        } else if (alphaKey.has(s[i])) {
            target += alphaKey.get(s[i]);
        } else {
            alphaKey.set(s[i], keys[nextKey]);
            alphaIndex.set(keys[nextKey], s[i]);
            target += keys[nextKey];
            nextKey++;
        }
    }

    let m;

    // to extract all matches from the string.
    while (m = tagPattern.exec(target)) {
        let ans = '';
        let key = '';
        for (let i = 0; i < m[1].length; i += 2) {
            key = m[1].substr(i, 2);

            // Return the original character from the string
            const mKey = alphaIndex.get(key);
            ans += mKey;
        }
        tags.push(ans);
    }

    return tags;
}

// To check whether the string line is RTL language or not.
function isRTL(s: string) {
    const rtlChars = '\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC';
    const rtlDirCheck = new RegExp('^[^'+rtlChars+']*?['+rtlChars+']');
    return rtlDirCheck.test(s);
};

function wrapDir(str: string) {
    return '\u202B' + str + '\u202C';
}

// To remove irregular whitespace.
// [Invisible Unicode characters](https://invisible-characters.com/#:~:text=Invisible%20Unicode%20characters%3F,%2B2800%20BRAILLE%20PATTERN%20BLANK).
function removeInvisibleCharacters(s: string) {
    return s.replace(/\u0009/g, ' ')
        .replace(/\u0020/g, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/\u00AD/g, ' ')
        .replace(/\u034F/g, ' ')
        .replace(/\u061C/g, ' ')
        .replace(/\u115F/g, ' ')
        .replace(/\u1160/g, ' ')
        .replace(/\u17B4/g, ' ')
        .replace(/\u17B5/g, ' ')
        .replace(/\u180E/g, ' ')
        .replace(/\u2000/g, ' ')
        .replace(/\u2001/g, ' ')
        .replace(/\u2002/g, ' ')
        .replace(/\u2003/g, ' ')
        .replace(/\u2004/g, ' ')
        .replace(/\u2005/g, ' ')
        .replace(/\u2006/g, ' ')
        .replace(/\u2007/g, ' ')
        .replace(/\u2008/g, ' ')
        .replace(/\u2009/g, ' ')
        .replace(/\u200A/g, ' ')
        .replace(/\u200B/g, ' ')
        .replace(/\u200C/g, ' ')
        .replace(/\u200D/g, ' ')
        .replace(/\u200E/g, ' ')
        .replace(/\u200F/g, ' ')
        .replace(/\u202F/g, ' ')
        .replace(/\u205F/g, ' ')
        .replace(/\u2060/g, ' ')
        .replace(/\u2061/g, ' ')
        .replace(/\u2062/g, ' ')
        .replace(/\u2063/g, ' ')
        .replace(/\u2064/g, ' ')
        .replace(/\u206A/g, ' ')
        .replace(/\u206B/g, ' ')
        .replace(/\u206C/g, ' ')
        .replace(/\u206D/g, ' ')
        .replace(/\u206E/g, ' ')
        .replace(/\u206F/g, ' ')
        .replace(/\u3000/g, ' ')
        .replace(/\u2800/g, ' ')
        .replace(/\u3164/g, ' ')
        .replace(/\uFEFF/g, ' ')
        .replace(/\uFFA0/g, ' ')
        .replace(/\u1D159/g, ' ')
        .replace(/\u1D173/g, ' ')
        .replace(/\u1D174/g, ' ')
        .replace(/\u1D175/g, ' ')
        .replace(/\u1D176/g, ' ')
        .replace(/\u1D177/g, ' ')
        .replace(/\u1D177/g, ' ')
        .replace(/\u1D179/g, ' ')
        .replace(/\u1D17/g, ' ');
}

export function noteLocationBySubject(s: string) {
    if (keys.length) {
        // reset index
        nextKey = 0;
    } else {
        generateKeys();
    }

    // To avoid 'Non-breaking space'.
    s = removeInvisibleCharacters(s);

    if (isRTL(s)) {
        s = wrapDir(s);
    }
    let _folders = emailFolders(s);
    const _tags = emailTags(s);

    // If no folder is mentioned, it will locate the note in the 'email messages' folder.
    if (_folders.length === 0) {
        _folders = ['email messages'];
    }

    return {folders: _folders, tags: _tags};
}
/*

function search(s: string, targetSet: string[]) {
    let temp = '';
    let flag = false;
    let noBoundery = true;
    const folders: string[] = [];

    for (let i = 0; i < s.length; i++) {
        if ((s[i] === ' ' || i === 0 ) && !flag) {
            noBoundery = true;
        } else if (s[i]!== ' ' && !flag && !targetSet.includes(s[i])) {
            noBoundery = false;
        }

        if (targetSet.includes(s[i]) && !flag && noBoundery) {
            flag = true;
        } else if (flag && s[i] !== ' ') {
            temp += s[i];
        } else if (s[i] === ' ' && flag && noBoundery) {
            if (temp !== '') {
                folders.push(temp);
            }
            flag = false;
            noBoundery = false;
            temp = '';
            i--;
        }
    }

    if (temp !== '') {
        folders.push(temp);
    }

    return folders;
}
*/
