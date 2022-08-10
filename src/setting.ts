import {SettingItemType} from 'api/types';
import {SECTION_NAME, EXPORT_TYPE, ATTACHMENTS, CONVERTED_MESSAGES} from './constants';

export const setting = {

    [EXPORT_TYPE]: {
        value: 'Markdown',
        type: SettingItemType.String,
        section: SECTION_NAME,
        isEnum: true,
        public: true,
        label: 'Export Type',
        options: {
            'Markdown': 'Markdown',
            'Text': 'Text',
            'HTML': 'HTML',
        },
    },

    [ATTACHMENTS]: {
        value: true,
        type: SettingItemType.Bool,
        section: SECTION_NAME,
        public: true,
        label: 'Include Attachments',

    },

    [CONVERTED_MESSAGES]: {
        value: {},
        type: SettingItemType.Object,
        public: false,
        label: 'Converted Messages',
    },

};
