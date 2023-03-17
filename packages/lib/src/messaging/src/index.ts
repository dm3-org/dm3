import { sign } from 'dm3-lib-crypto';
import stringify from 'safe-stable-stringify';
// eslint-disable-next-line max-len
import { Message } from './Message';

export type {
    DeliveryInformation,
    EncryptionEnvelop,
    Envelop,
} from './Envelop';
export { MessageState } from './Message';
export type {
    Message,
    MessageMetadata,
    Postmark,
    SendDependencies,
} from './Message';
export * as schema from './schema';
export { getId } from './Utils';

export { buildEnvelop } from './Envelop';

export async function createMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
): Promise<Message> {
    const messgeWithoutSig: Omit<Message, 'signature'> = {
        message,
        metadata: {
            type: 'NEW',
            to,
            from,
            timestamp: new Date().getTime(),
        },
    };

    return {
        ...messgeWithoutSig,
        signature: await sign(stringify(messgeWithoutSig), privateKey),
    };
}
