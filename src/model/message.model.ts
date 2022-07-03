
export interface Login {
    login: true,
    email: string,
    password: string
}

// Type predicates
export function isLogin(message: any): message is Login {
    return 'login' in message && 'email' in message && 'password' in message;
}

export interface Hide {
    hide: boolean
}

// Type predicates
export function isHide(message: any): message is Hide {
    return 'hide' in message;
}


export interface ManualConnection {
    manual_connection: boolean
}

// Type predicates
export function isManualConnection(message: any): message is ManualConnection {
    return 'manual_connection' in message;
}


export type Message = Login | ManualConnection | Hide;