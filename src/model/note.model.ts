export interface Note{
    title: string,
    parent_id:string,
    body?: string,
    body_html?: string,
    is_todo: number,
    markup_language: number
}
