import {
    DeliveryServiceProfile,
    GetResource,
    getDeliveryServiceProfile,
    getUserProfile,
} from 'dm3-lib-profile';
import { ProxyEnvelop } from './ProxyEnvelop';
import { ethers } from 'ethers';
import { log } from 'dm3-lib-shared';
import { EncryptionEnvelop } from './Envelop';

export type ProxySendParams = {
    provider: ethers.providers.JsonRpcProvider;
    proxyEnvelop: ProxyEnvelop;
    getRessource: GetResource<DeliveryServiceProfile>;
    submitMessage: (url: string, envelop: EncryptionEnvelop) => Promise<void>;
};

async function trySend(
    dsName: string,
    proxySendParams: ProxySendParams,
): Promise<boolean> {
    try {
        const dsProfile = await getDeliveryServiceProfile(
            dsName,
            proxySendParams.provider,
            proxySendParams.getRessource,
        );

        if (!dsProfile) {
            throw Error(
                `Couldn't fetch a profile for delivery service ${dsName}`,
            );
        }

        const envelopContainer =
            proxySendParams.proxyEnvelop.encryptionEnvelops.find(
                (envelops) => envelops.deliveryServiceEnsName === dsName,
            );

        if (!envelopContainer) {
            throw Error(`Couldn't find an envelop for ${dsName}`);
        }

        await proxySendParams.submitMessage(dsProfile.url, {
            ...envelopContainer.encryptionEnvelop,
            message: proxySendParams.proxyEnvelop.encryptedMessage,
        });

        return true;
    } catch (e) {
        log(
            `Failed to send message using: ${dsName} (${(e as Error).message})`,
        );
        return false;
    }
}

export async function sendOverMessageProxy(proxySendParams: ProxySendParams) {
    const userProfile = await getUserProfile(
        proxySendParams.provider,
        proxySendParams.proxyEnvelop.to,
    );

    if (!userProfile) {
        throw Error(`Couldn't fetch user profile`);
    }

    const deliveryServiceNames = [...userProfile.profile.deliveryServices];
    let success = false;
    let dsName = deliveryServiceNames.shift();

    while (!success && dsName) {
        success = await trySend(dsName, proxySendParams);
        dsName = deliveryServiceNames.shift();
    }

    if (!success) {
        throw Error(`Couldn't send message.`);
    }
}
