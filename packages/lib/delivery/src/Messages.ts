import {
    DeliveryServiceProfileKeys,
    normalizeEnsName,
    UserProfile,
} from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';

import {
    decryptAsymmetric,
    encryptAsymmetric,
    EncryptedPayload,
    KeyPair,
    sign,
} from '@dm3-org/dm3-lib-crypto';
import {
    DeliveryInformation,
    EncryptionEnvelop,
    Postmark,
} from '@dm3-org/dm3-lib-messaging';
import { sha256 } from '@dm3-org/dm3-lib-shared';

export interface Acknowledgement {
    contactAddress: string;
    messageHash: string;
}

export function getConversationId(ensNameA: string, ensNameB: string): string {
    return [normalizeEnsName(ensNameA), normalizeEnsName(ensNameB)].join();
}

export async function decryptDeliveryInformation(
    encryptedEnvelop: EncryptionEnvelop,
    encryptionKeyPair: KeyPair,
): Promise<DeliveryInformation> {
    return JSON.parse(
        await decryptAsymmetric(
            encryptionKeyPair,
            JSON.parse(encryptedEnvelop.metadata.deliveryInformation as string),
        ),
    );
}
export async function handleIncomingMessage(
    encryptedEnvelop: EncryptionEnvelop,
    deliveryServiceKeys: DeliveryServiceProfileKeys,
    receiverProfile: UserProfile,
): Promise<{
    encryptedEnvelop: Required<EncryptionEnvelop>;
    decryptedDeliveryInformation: DeliveryInformation;
}> {
    const postmark = await addPostmark(
        encryptedEnvelop,
        receiverProfile.publicEncryptionKey,
        deliveryServiceKeys.signingKeyPair.privateKey,
    );
    return {
        encryptedEnvelop: {
            ...encryptedEnvelop,
            postmark: stringify(postmark),
        },
        decryptedDeliveryInformation: await decryptDeliveryInformation(
            encryptedEnvelop,
            deliveryServiceKeys.encryptionKeyPair,
        ),
    };
}

export async function addPostmark(
    { message }: EncryptionEnvelop,
    receiverEncryptionKey: string,
    deliveryServiceSigningKey: string,
): Promise<EncryptedPayload> {
    function signPostmark(
        p: Omit<Postmark, 'signature'>,
        signingKey: string,
    ): Promise<string> {
        const postmarkHash = sha256(stringify(p));
        return sign(signingKey, postmarkHash);
    }
    const postmarkWithoutSig: Omit<Postmark, 'signature'> = {
        messageHash: ethers.utils.hashMessage(stringify(message)),
        incommingTimestamp: new Date().getTime(),
    };

    const signature = await signPostmark(
        postmarkWithoutSig,
        deliveryServiceSigningKey,
    );

    //Encrypte the signed Postmark and return the ciphertext
    const { ciphertext, nonce, ephemPublicKey } = await encryptAsymmetric(
        receiverEncryptionKey,
        stringify({ ...postmarkWithoutSig, signature })!,
    );

    return {
        nonce,
        ciphertext,
        ephemPublicKey,
    };
}
