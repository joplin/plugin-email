import {noteLocationBySubject} from '../src/core/noteLocationBySubject';

describe('Naive Case.', ()=>{
    it(`Extract 'joplin' as a note and 'note' as a tag.`, ()=>{
        const loc = noteLocationBySubject('s @joplin #note');
        const ans = {
            folders: ['joplin'],
            tags: ['note'],
        };
        expect(loc).toEqual(ans);
    });

    it('lowercase', ()=>{
        const loc = noteLocationBySubject('@joplin #joplin');
        const ans = {
            folders: ['joplin'],
            tags: ['joplin'],
        };
        expect(loc).toEqual(ans);
    });

    it('uppercase', ()=>{
        const loc = noteLocationBySubject('@JOPLIN #JOPLIN');
        const ans = {
            folders: ['JOPLIN'],
            tags: ['JOPLIN'],
        };
        expect(loc).toEqual(ans);
    });
});

describe('The subject without folders or tags.', ()=>{
    it(`It will return two empty arrays of subjects and tags in the subject that don't contain mentions and tags.`, ()=>{
        const loc = noteLocationBySubject('subject test');
        const ans = {
            folders: ['email messages'],
            tags: [],
        };
        expect(loc).toEqual(ans);
    });

    it(`Empty subject.`, ()=>{
        const loc = noteLocationBySubject('');
        const ans = {
            folders: ['email messages'],
            tags: [],
        };
        expect(loc).toEqual(ans);
    });

    it('Should ignore the empty mention or empty tag.', ()=>{
        const loc = noteLocationBySubject('subject @ @ joplin @ @ @ @ @ # # # # # joplin # # joplin');
        const ans = {
            folders: ['email messages'],
            tags: [],
        };
        expect(loc).toEqual(ans);
    });
});

describe('@ symbol between text.', ()=>{
    it('Should ignore the @ symbol between text.', ()=>{
        const loc = noteLocationBySubject('subject email@gmail.com test@test @joplin @email_plugin #joplin');
        const ans = {
            folders: ['joplin', 'email_plugin'],
            tags: ['joplin'],
        };
        expect(loc).toEqual(ans);
    });


    it('Should ignore the @ symbol between text.', ()=>{
        const loc = noteLocationBySubject('subject email@gmail.com test@test@joplin@email_plugin #joplin');
        const ans = {
            folders: ['email messages'],
            tags: ['joplin'],
        };
        expect(loc).toEqual(ans);
    });


    it('Should ignore the @ symbol inside an email.', ()=>{
        const loc = noteLocationBySubject('subject email@gmail.com @joplin #joplin email2@gmail.com');
        const ans = {
            folders: ['joplin'],
            tags: ['joplin'],
        };
        expect(loc).toEqual(ans);
    });
});


describe('Special character.', ()=>{
    it('Dealing with underscores within folders or emojis within tags', ()=>{
        const loc = noteLocationBySubject('subject email@gmail.com test@test @joplin @email_plugin #joplin💖');
        const ans = {
            folders: ['joplin', 'email_plugin'],
            tags: ['joplin💖'],
        };
        expect(loc).toEqual(ans);
    });


    it('Dealing with underscores within folders.', ()=>{
        const loc = noteLocationBySubject('subject @50 @google.com @_gmail_proton*outlook');
        const ans = {
            folders: ['50', 'google.com', '_gmail_proton*outlook'],
            tags: [],
        };
        expect(loc).toEqual(ans);
    });
});

describe('# within the name of a folder or @ within the name of a tag.', ()=>{
    it('# within the name of a folder.', ()=>{
        const loc = noteLocationBySubject('subject @#go');
        const ans = {
            folders: ['#go'],
            tags: [],
        };
        expect(loc).toEqual(ans);
    });

    it('@ within the name of a tag.', ()=>{
        const loc = noteLocationBySubject('subject #@go');
        const ans = {
            folders: ['email messages'],
            tags: ['@go'],
        };
        expect(loc).toEqual(ans);
    });
});

describe('Mention boundary.', ()=>{
    it('Subject starts with mentioning a folder and ends with a tag.', ()=>{
        const loc = noteLocationBySubject('@joplin subject #tag');
        const ans = {
            folders: ['joplin'],
            tags: ['tag'],
        };

        expect(loc).toEqual(ans);
    });

    it('Subject starts with mentioning a tag and ends with a folder.', ()=>{
        const loc = noteLocationBySubject('subect# #tag @subject@ @joplin # #  ＠go ﹫go');
        const ans = {
            folders: ['joplin', 'go', 'go'],
            tags: ['tag'],
        };

        expect(loc).toEqual(ans);
    });
});

describe('Irregular spaces.', ()=>{
    it('should ignore irregular spaces between folders and tags.', ()=>{
        const loc = noteLocationBySubject('why and but @note #note @good #tag  ');

        const ans = {
            folders: ['note', 'good'],
            tags: ['note', 'tag'],
        };

        expect(loc).toEqual(ans);
    });

    it('should ignore irregular spaces between folders and tags.', ()=>{
        const loc = noteLocationBySubject('     @note #note @good #tag  ');

        const ans = {
            folders: ['note', 'good'],
            tags: ['note', 'tag'],
        };

        expect(loc).toEqual(ans);
    });
});
