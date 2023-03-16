import { ethers } from 'ethers';
import { stringify } from 'dm3-lib-shared';
import { Envelop } from './Envelop';

export function getId(envelop: Envelop): string {
    return ethers.utils.id(stringify(envelop.message));
}
