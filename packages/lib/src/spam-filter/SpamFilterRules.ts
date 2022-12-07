export interface SpamFilterRules {
    // the minimum nonce of the sender's address
    // (optional)
    [Rules.MIN_NONCE]?: number;
    // the minimum balcance of the senders address
    // (optional)
    [Rules.MIN_BALANCE]?: string;
}

export enum Rules {
    MIN_NONCE = 'minNonce',
    MIN_BALANCE = 'minBalance',
}
