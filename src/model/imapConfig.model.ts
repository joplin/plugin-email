
export interface ImapConfig {
    user: string,
    password: string,
    type: string,
    host: string,
    port: number,
    tls?: boolean,
    tlsOptions?: object,
}