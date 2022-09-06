export interface ExportCriteria{
    exportType: 'HTML' | 'Markdown' | 'Text',
    includeAttachments: boolean,
    attachmentsStyle: 'Table' | 'Link'
}
