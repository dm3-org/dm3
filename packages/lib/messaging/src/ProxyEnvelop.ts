import { EncryptAsymmetric } from 'dm3-lib-crypto';
import { EncryptionEnvelop, buildEnvelop } from './Envelop';
import { Message, SendDependencies } from './Message';
import {
    DeliveryServiceProfile,
    GetResource,
    getDeliveryServiceProfile,
} from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { stringify } from 'dm3-lib-shared';

export interface ProxEnvelop {
    to: string;
    encryptedMessage: string;
    encryptionEnvelops: {
        encryptionEnvelop: Omit<EncryptionEnvelop, 'message'>;
        deliveryServiceEnsName: string;
    }[];
}

export async function createProxyEnvelop(
    provider: ethers.providers.JsonRpcProvider,
    message: Message,
    encryptAsymmetric: EncryptAsymmetric,
    sendDependencies: Omit<SendDependencies, 'deliveryServiceEncryptionPubKey'>,
    getRessource: GetResource<DeliveryServiceProfile>,
): Promise<ProxEnvelop> {
    if (!sendDependencies.to.profile) {
        throw Error('No profile');
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
                                deliveryServiceEncryptionPubKey:
                                    dsProfile.profile!.publicEncryptionKey,
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
