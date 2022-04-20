import { ethers } from 'ethers';
import { Envelop } from './Messaging';
import { PublicEnvelop } from './PublicMessaging';

export function getId(envelop: Envelop | PublicEnvelop): string {
    return ethers.utils.id(JSON.stringify(envelop.message));
}
