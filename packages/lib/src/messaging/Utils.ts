import { ethers } from 'ethers';
import { Envelop } from './Messaging';

export function getId(envelop: Envelop): string {
    return ethers.utils.id(JSON.stringify(envelop.message));
}
