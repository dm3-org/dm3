import { ethers } from 'ethers';
import stringify from 'safe-stable-stringify';
import { Envelop } from './Messaging';

export function getId(envelop: Envelop): string {
    return ethers.utils.id(stringify(envelop.message));
}
