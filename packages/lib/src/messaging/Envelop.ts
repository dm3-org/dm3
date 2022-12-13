import { EncryptAsymmetric, sign } from '../crypto';
import { sha256 } from '../shared/sha256';
import { stringify } from '../shared/stringify';
import { Message, Postmark, SendDependencies } from './Message';

export interface EnvelopeMetadata {
    version: string;
    encryptionScheme?: string;
    deliveryInformation: string | DeliveryInformation;
    encryptedMessageHash: string;
    signature: string;
}

export interface EncryptionEnvelop {
    message: string;
    metadata: EnvelopeMetadata;
    postmark?: string;
}

export interface Envelop {
    message: Message;
    metadata?: EnvelopeMetadata;
    postmark?: Postmark;
    id?: string;
}

export interface DeliveryInformation {
    to: string;
    from: string;
    deliveryInstruction?: string;
}

export async function buildEnvelop(
    message: Message,
    encryptAsymmetric: EncryptAsymmetric,
    { to, from, deliveryServiceEncryptionPubKey, keys }: SendDependencies,
): Promise<{ encryptedEnvelop: EncryptionEnvelop; envelop: Envelop }> {
    if (!to.profile) {
        throw Error('Contact has no profile');
    }

    const encryptedMessage = stringify(
        await encryptAsymmetric(
            to.profile.publicEncryptionKey,
            stringify(message),
        ),
    );

    const deliveryInformation: DeliveryInformation = {
        to: to.address,
        from: from.address,
    };

    const envelopeMetadata: Omit<EnvelopeMetadata, 'signature'> = {
        encryptionScheme: 'x25519-chacha20-poly1305',
        deliveryInformation: stringify(
            await encryptAsymmetric(
                deliveryServiceEncryptionPubKey,
                stringify(deliveryInformation),
            ),
        ),
        encryptedMessageHash: sha256(stringify(encryptedMessage)),
        version: 'v1',
    };

    const metadata = {
        ...envelopeMetadata,
        signature: await sign(
            keys.signingKeyPair.privateKey,
            stringify(envelopeMetadata),
        ),
    };

    return {
        encryptedEnvelop: {
            message: encryptedMessage,
            metadata,
        },
        envelop: {
            message,
            metadata: { ...metadata, deliveryInformation },
        },
    };
}
