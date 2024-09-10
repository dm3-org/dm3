import { EncryptAsymmetric, encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    EncryptionEnvelop,
    buildEnvelop,
    createEnvelop,
    createSendDependencies,
} from './Envelop';
import { Message, SendDependencies } from './Message';
import {
    DeliveryServiceProfile,
    GetResource,
    ProfileKeys,
    getDeliveryServiceProfile,
} from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { stringify } from '@dm3-org/dm3-lib-shared';

export interface ProxyEnvelop {
    to: string;
    encryptedMessage: string;
    encryptionEnvelops: {
        encryptionEnvelop: Omit<EncryptionEnvelop, 'message'>;
        deliveryServiceEnsName: string;
    }[];
}

export async function createProxyEnvelop(
    message: Message,
    provider: ethers.providers.JsonRpcProvider,
    keys: ProfileKeys,
    getRessource: GetResource<DeliveryServiceProfile>,
    sendDependenciesCache?: Partial<SendDependencies>,
): Promise<ProxyEnvelop> {
    const sendDependencies = await createSendDependencies(
        message.metadata.to,
        message.metadata.from,
        provider,
        keys,
        getRessource,
        sendDependenciesCache,
    );

    if (!sendDependencies.to.profile) {
        throw Error(`No receiver profile.`);
    }

    const isFulfilled = <T>(
        p: PromiseSettledResult<T>,
    ): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';

    const dsProfiles = (
        await Promise.allSettled(
            sendDependencies.to.profile.deliveryServices.map(async (dsEns) => ({
                deliveryServiceEnsName: dsEns,
                profile: await getDeliveryServiceProfile(
                    dsEns,
                    provider,
                    getRessource,
                ),
            })),
        )
    )
        .filter(isFulfilled)
        .map((settledResult) => settledResult.value);

    const encryptedMessage = stringify(
        await encryptAsymmetric(
            sendDependencies.to.profile.publicEncryptionKey,
            stringify(message),
        ),
    );

    const encryptionEnvelops = await Promise.all(
        dsProfiles.map(
            async (
                dsProfile,
            ): Promise<{
                encryptionEnvelop: Omit<EncryptionEnvelop, 'message'>;
                deliveryServiceEnsName: string;
            }> => ({
                encryptionEnvelop: {
                    metadata: (
                        await buildEnvelop(
                            message,
                            encryptAsymmetric,
                            {
                                ...sendDependencies,
                                deliverServiceProfile: dsProfile.profile!,
                            },
                            encryptedMessage,
                        )
                    ).encryptedEnvelop.metadata,
                },
                deliveryServiceEnsName: dsProfile.deliveryServiceEnsName,
            }),
        ),
    );

    return {
        encryptedMessage,
        to: sendDependencies.to.ensName,
        encryptionEnvelops,
    };
}
