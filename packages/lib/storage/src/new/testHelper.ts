import { Envelop, Message, MessageState } from '@dm3-org/dm3-lib-messaging';
import { sha256 } from '@dm3-org/dm3-lib-shared';
import {
    AccountManifest,
    Chunk,
    ConversationList,
    ConversationManifest,
    Db,
    MessageChunk,
    ReadStrategy,
} from './types';
import {
    getAccountManifestKey,
    getConversationListKey,
    getConversationManifestKey,
    getMessageChunkKey,
} from './keys';

export function makeEnvelop(
    from: string,
    to: string,
    msg: string,
    timestamp: number = 0,
) {
    const message: Message = {
        metadata: {
            to,
            from,
            timestamp,
            type: 'NEW',
        },
        message: msg,
        signature: '',
    };

    const envelop: Envelop = {
        message,
        metadata: {
            deliveryInformation: {
                from: '',
                to: '',
                deliveryInstruction: '',
            },
            encryptedMessageHash: '',
            version: '',
            encryptionScheme: '',
            signature: '',
        },
    };

    return envelop;
}

export const sign = async (data: string) => sha256(data);
export const testEnvelop = makeEnvelop('from1', 'to1', 'message', Date.now());
