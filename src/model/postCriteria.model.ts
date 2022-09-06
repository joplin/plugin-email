import {EmailContent} from './emailContent.model';
import {ExportCriteria} from './exportCriteria.model';

export interface PostCriteria{
    emailContent: EmailContent,
    exportCriteria: ExportCriteria,
    tempFolderPath: string,
    folderId?: string,
    tags?: string[],
}

export function isPostBySubject(postCriteria: PostCriteria) {
    return 'emailContent' in postCriteria && 'exportCriteria' in postCriteria && 'tempFolderPath' in postCriteria && Object.keys(postCriteria).length === 3;
}

export function isPostByFolderId(postCriteria: PostCriteria) {
    return 'emailContent' in postCriteria && 'exportCriteria' in postCriteria && 'tempFolderPath' in postCriteria && 'folderId' in postCriteria && 'tags' in postCriteria;
}
