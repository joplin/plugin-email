
export interface EmailProvider {
    type: string,
    host: string,
    port: number,
    tls?: boolean,
}