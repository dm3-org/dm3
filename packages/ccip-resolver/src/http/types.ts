import { ethers } from 'ethers';

export interface WithLocals {
    locals: Record<string, any> &
        Record<'web3Provider', ethers.providers.BaseProvider>;
}
