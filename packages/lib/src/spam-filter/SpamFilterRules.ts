import { EthBalanceFilterSettings } from './filter/EthBalanceFilter';
import { NonceFilterSettings } from './filter/NonceFilter';

export interface SpamFilterRules {
    // the minimum nonce of the sender's address
    // (optional)
    [SpamFilterRule.MIN_NONCE]?: NonceFilterSettings;
    // the minimum balcance of the senders address
    // (optional)
    [SpamFilterRule.MIN_BALANCE]?: EthBalanceFilterSettings;
}

export enum SpamFilterRule {
    MIN_NONCE = 'minNonce',
    MIN_BALANCE = 'minBalance',
}
