import { EthBalanceFilterSettings } from './filter/ethBalanceFilter/EthBalanceFilter';
import { NonceFilterSettings } from './filter/nonceFilter/NonceFilter';
import { TokenBalanceFilterSettings } from './filter/tokenBalanceFilter/TokenBalanceFilter';

export interface SpamFilterRules {
    // the minimum nonce of the sender's address
    // (optional)
    [SpamFilterRule.MIN_NONCE]?: NonceFilterSettings;
    // the minimum balcance of the senders address
    // (optional)
    [SpamFilterRule.MIN_BALANCE]?: EthBalanceFilterSettings;
    // the minimum balance of an erc20 token
    // (optional)
    [SpamFilterRule.MIN_TOKEN_BALANCE]?: TokenBalanceFilterSettings;
}

export enum SpamFilterRule {
    MIN_NONCE = 'minNonce',
    MIN_BALANCE = 'minBalance',
    MIN_TOKEN_BALANCE = 'minTokenBalance',
}
