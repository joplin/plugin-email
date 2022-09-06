import {SettingItemType} from 'api/types';
import {SECTION_NAME, EXPORT_TYPE, ATTACHMENTS, ATTACHMENTS_STYLE, ACCOUNTS, LAST_STATE} from './constants';

export const setting = {

    [EXPORT_TYPE]: {
        value: 'HTML',
        type: SettingItemType.String,
        section: SECTION_NAME,
        isEnum: true,
        public: true,
        label: 'Export Type',
        options: {
            'HTML': 'HTML',
            'Markdown': 'Markdown',
            'Text': 'Text',
        },
    },

    [ATTACHMENTS]: {
        value: true,
        type: SettingItemType.Bool,
        section: SECTION_NAME,
        public: true,
        label: 'Include Attachments',

    },

    [ATTACHMENTS_STYLE]: {
        value: 'Table',
        type: SettingItemType.String,
        section: SECTION_NAME,
        isEnum: true,
        public: true,
        label: 'Attachments Style',
        options: {
            'Table': 'Table',
            'Link': 'Link',
        },
        description: 'Note: Table Style displays images and videos in the note.',
    },

    [ACCOUNTS]: {
        value: {},
        type: SettingItemType.Object,
        section: SECTION_NAME,
        secure: true,
        public: true,
        label: 'Accounts',
    },

    [LAST_STATE]: {
        value: {},
        type: SettingItemType.Object,
        section: SECTION_NAME,
        secure: true,
        public: true,
        label: 'Last_State',
    },

};
