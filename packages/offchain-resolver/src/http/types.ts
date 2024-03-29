import { ethers } from 'ethers';
import { IDatabase } from '../persistence/IDatabase';

export interface WithLocals {
    locals: Record<string, any> &
        Record<'config', { spamProtection: boolean }> &
        Record<'db', IDatabase> &
        Record<'web3Provider', ethers.providers.BaseProvider>;
}
