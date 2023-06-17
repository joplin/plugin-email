export const SECTION_NAME = 'Email_Plugin';
export const EXPORT_TYPE = 'Export_Type';
export const ATTACHMENTS = 'Attachments';
export const PLUGIN_ICON = 'fa fa-envelope';
export const ATTACHMENTS_STYLE = 'Attachments_Style';
export const ACCOUNTS = 'Accounts';
export const LAST_STATE = 'Last_State';

// This regexs from https://github.com/regexhq/mentions-regex/blob/master/index.js
// @folder regex Regular expression for matching @foldre mentions
export const MENTIONS_REGEX = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:﹫|@|＠)(?!\/))([a-zA-Z0-9/_.]{1,150})(?:\b(?!﹫|@|＠|#|⋕|♯|⌗)|$)/g;

// #tag regex Regular expression for matching #tag mentions
export const TAGS_REGEX = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:#|⋕|♯|⌗)(?!\/))([a-zA-Z0-9/_.]{1,150})(?:\b(?!﹫|@|＠|#|⋕|♯|⌗)|$)/g;
