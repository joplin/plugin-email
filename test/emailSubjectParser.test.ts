import EmailSubjectParser from '../src/core/emailSubjectParser';
import SubjectMetadata from '../src/model/subjectMetadata.model';

describe('Naive Case.', ()=>{
    it(`Extract 'joplin' as a note and 'note' as a tag.`, ()=>{
        const subject = 's @joplin #note';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin'],
            tags: ['note'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });

    it('lowercase', ()=>{
        const subject = '@joplin #joplin';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin'],
            tags: ['joplin'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });

    it('uppercase', ()=>{
        const subject = '@JOPLIN #JOPLIN';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['JOPLIN'],
            tags: ['joplin'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });
});

describe('The subject without folders or tags.', ()=>{
    it(`It will return two empty arrays of subjects and tags in the subject that don't contain mentions and tags.`, ()=>{
        const subject = 'subject test';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['email messages'],
            tags: [],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });

    it(`Empty subject.`, ()=>{
        const subject = '';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['email messages'],
            tags: [],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });

    it('Should ignore the empty mention or empty tag.', ()=>{
        const subject = 'subject @ @ joplin @ @ @ @ @ # # # # # joplin # # joplin';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['email messages'],
            tags: [],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });
});

describe('@ symbol between text.', ()=>{
    it('Should ignore the @ symbol between text.', ()=>{
        const subject = 'subject email@gmail.com test@test @joplin @email_plugin #joplin';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin', 'email_plugin'],
            tags: ['joplin'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });

    it('Should ignore the @ symbol between text.', ()=>{
        const subject = 'subject email@gmail.com test@test@joplin@email_plugin #joplin';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['email messages'],
            tags: ['joplin'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });


    it('Should ignore the @ symbol inside an email.', ()=>{
        const subject = 'subject email@gmail.com @joplin #joplin email2@gmail.com';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin'],
            tags: ['joplin'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });
});


describe('Special character.', ()=>{
    it('Dealing with underscores within folders or emojis within tags', ()=>{
        const subject = 'subject email@gmail.com test@test @joplin @email_plugin #joplin💖';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin', 'email_plugin'],
            tags: ['joplin💖'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });


    it('Dealing with underscores within folders.', ()=>{
        const subject = 'subject @50 @google.com @_gmail_proton*outlook';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['50', 'google.com', '_gmail_proton*outlook'],
            tags: [],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });
});

describe('Mention boundary.', ()=>{
    it('Subject starts with mentioning a folder and ends with a tag.', ()=>{
        const subject = '@joplin subject #tag';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin'],
            tags: ['tag'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });

    it('Subject starts with mentioning a tag and ends with a folder.', ()=>{
        const subject = 'subect# #tag @subject@ @joplin # #  ＠go ﹫go';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin', 'go', 'go'],
            tags: ['tag'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });
});

describe('Irregular spaces.', ()=>{
    it('should ignore irregular spaces between folders and tags.', ()=>{
        const subject = 'why and but @note #note @good #tag  ';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['note', 'good'],
            tags: ['note', 'tag'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });

    it('should ignore irregular spaces between folders and tags.', ()=>{
        const subject = '     @note #note @good #tag  ';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['note', 'good'],
            tags: ['note', 'tag'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });
});

describe('Subject with duplicate tags.', ()=>{
    it('should ignore duplicates tags.', ()=>{
        const subject = 'email subject @joplin #joplin #gmail #joplin #tag #TAG';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin'],
            tags: ['joplin', 'gmail', 'tag'],
            isTodo: 0,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });
});


describe('Subject starts with an exclamation mark (note marked as todo)', ()=>{
    it('note marked as todo.', ()=>{
        const subject = '! email subject @joplin #joplin #gmail #joplin #tag #TAG';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['joplin'],
            tags: ['joplin', 'gmail', 'tag'],
            isTodo: 1,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });

    it('note marked as todo', ()=>{
        const subject = '!';
        const parser = new EmailSubjectParser(subject);
        const subjectMetadata = parser.parse();

        const expectedSubjectMetadata: SubjectMetadata = {
            folders: ['email messages'],
            tags: [],
            isTodo: 1,
        };

        expect(subjectMetadata).toEqual(expectedSubjectMetadata);
    });
});
