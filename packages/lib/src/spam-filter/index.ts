import { decryptAsymmetric, KeyPair } from '../crypto';
import { DeliveryInformation, EncryptionEnvelop } from '../messaging/Messaging';

export interface SpamFilter {
    filter(e: DeliveryInformation): Promise<boolean>;
}

export function reduceSpamFilters(
    filter: SpamFilter[],
    encryptionKeyPair: KeyPair,
) {
    const filterEnvelop = async ({
        deliveryInformation,
    }: EncryptionEnvelop) => {
        const decryptedDeliveryInformation: DeliveryInformation = JSON.parse(
            await decryptAsymmetric(
                encryptionKeyPair,
                JSON.parse(deliveryInformation),
            ),
        );
        const filterPromises = await Promise.all(
            filter.map((f) => f.filter(decryptedDeliveryInformation)),
        );

        return filterPromises.reduce(
            (agg, cur) => (agg === false ? false : cur),
            true,
        );
    };

    return async (envelop: EncryptionEnvelop[]) => {
        const results = await Promise.all(envelop.map(filterEnvelop));
        return envelop.filter((_, index) => results[index]);
    };
}
