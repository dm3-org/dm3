import ethers from 'ethers';
import { readKeyFromEnv } from './readKeyEnv';
export function getSigner() {
    const privateKey = readKeyFromEnv('SIGNER_PRIVATE_KEY');
    return new ethers.Wallet(privateKey);
}
