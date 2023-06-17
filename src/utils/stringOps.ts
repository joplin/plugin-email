class StringOps {
    // To check whether the string line is RTL language or not.
    static isRTL(s: string): boolean {
        const rtlChars = '\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC';
        const rtlDirCheck = new RegExp('^[^'+rtlChars+']*?['+rtlChars+']');
        return rtlDirCheck.test(s);
    };

    static wrapDir(str: string): string {
        return '\u202B' + str + '\u202C';
    };

    static escapeHTML(str: string): string {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, ' &lt;')
            .replace(/>/g, ' &gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // To remove irregular whitespace.
    // [Invisible Unicode characters](https://invisible-characters.com/#:~:text=Invisible%20Unicode%20characters%3F,%2B2800%20BRAILLE%20PATTERN%20BLANK).
    static removeIrregularSpaces(s: string): string {
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
    };
}

export default StringOps;
