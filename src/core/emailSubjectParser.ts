import StringOps from '../utils/stringOps';
import {MENTIONS_REGEX, TAGS_REGEX} from '../constants';
import SubjectMetadata from '../model/subjectMetadata.model';

class EmailSubjectParser {
    subjectMetadata: SubjectMetadata;
    subject: string;
    subjectPattern: string;

    constructor(subject: string) {
        this.subject = subject;
        this.subjectPattern = '';
        this.subjectMetadata = {
            isTodo: 0,
            folders: ['email messages'], // Default note location if no specific folder is mentioned.
            tags: [],
        };
    }

    parse(): SubjectMetadata {
        this.removeIrregularSpaces()
            .checkDir()
            .generateSubjectPattern()
            .extractFolders()
            .extractTags()
            .isTodo();

        return this.subjectMetadata;
    };

    removeIrregularSpaces() {
        const {subject} = this;
        const {removeIrregularSpaces} = StringOps;
        this.subject = removeIrregularSpaces(subject);
        return this;
    };

    checkDir() {
        const {subject} = this;
        const {wrapDir, isRTL} = StringOps;
        this.subject = isRTL(subject) ? wrapDir(subject): subject;
        return this;
    };

    isTodo() {
        const {subject} = this;
        this.subjectMetadata.isTodo = subject.startsWith('!') ? 1 : 0;
        return this;
    };

    // to add the ability to run regex extraction on different languages and different regular emojis, e.g. @joplin -> @xxxxxx.
    generateSubjectPattern() {
        const {subject} = this;
        const allowedSymbols = [' ', '@', '＠', '﹫', '#', '♯', '⌗', '⋕', '!'];
        const patternFun = (c: string) => allowedSymbols.includes(c) ? c : 'x';

        this.subjectPattern = Array.from(subject, patternFun)
            .join('');

        return this;
    };

    extractFolders() {
        const {subject, subjectPattern} = this;
        const folders: string[] = [];
        let match: RegExpExecArray;

        while (match = MENTIONS_REGEX.exec(subjectPattern)) {
            const mention = Array.from(subject)
                .slice(match.index, MENTIONS_REGEX.lastIndex)
                .join('')
                .trim()
                .substring(1); // remove mention symbol

            folders.push(mention);
        }

        folders.length && (this.subjectMetadata.folders = folders);

        return this;
    };

    extractTags() {
        const {subject, subjectPattern} = this;
        const tags: string[] = [];
        let match: RegExpExecArray;

        while (match = TAGS_REGEX.exec(subjectPattern)) {
            const tag = Array.from(subject)
                .slice(match.index, TAGS_REGEX.lastIndex)
                .join('')
                .trim()
                .substring(1); // remove tag symbol

            tags.push(tag);
        }

        // To lowercase all tags to avoid overwriting the same tag again.
        this.subjectMetadata.tags = [...new Set(tags.map((e) => e.toLowerCase()))];

        return this;
    };
}

export default EmailSubjectParser;
