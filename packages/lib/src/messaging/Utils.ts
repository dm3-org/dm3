import { ethers } from 'ethers';
import { stringify } from '../shared/stringify';
import { Envelop } from './Envelop';

export function getId(envelop: Envelop): string {
    return ethers.utils.id(stringify(envelop.message));
}
