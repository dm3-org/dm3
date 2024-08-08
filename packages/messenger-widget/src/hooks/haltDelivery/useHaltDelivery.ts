import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { buildEnvelop } from '@dm3-org/dm3-lib-messaging';
import {
    Account,
    DeliveryServiceProfile,
    getUserProfile,
} from '@dm3-org/dm3-lib-profile';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MainnetProviderContext } from '../../context/ProviderContext';
import { StorageContext } from '../../context/StorageContext';
import { TLDContext } from '../../context/TLDContext';
import { fetchDsProfiles } from '../../utils/deliveryService/fetchDsProfiles';
import { submitEnvelopsToReceiversDs } from '../../utils/deliveryService/submitEnvelopsToReceiversDs';

export const useHaltDelivery = () => {
    const {
        getHaltedMessages,
        clearHaltedMessages,
        initialized: storageInitialized,
    } = useContext(StorageContext);

    const { account: sendersAccount, profileKeys } = useContext(AuthContext);
    const { provider } = useContext(MainnetProviderContext);
    const { resolveTLDtoAlias } = useContext(TLDContext);

    useEffect(() => {
        if (!storageInitialized) {
            return;
        }
        // Fetch all messages the user has halted. Then check if they can be delivered now.
        const handleHaltedMessages = async () => {
            const haltedMessages = await getHaltedMessages();

            //Get all recipients of the halted messages
            const recipients = Array.from(
                new Set(
                    haltedMessages.map(
                        (message) => message.envelop.message.metadata.to,
                    ),
                ),
            );

            //Resolve the  tldNames to their aliases
            const resolvedAliases = await Promise.all(
                recipients.map(async (ensName) => ({
                    ensName,
                    aliasName: await resolveTLDtoAlias(ensName),
                })),
            );

            //For each recipient, get the users account
            const withAccounts = await Promise.all(
                resolvedAliases.map(
                    async ({
                        ensName,
                        aliasName,
                    }: {
                        ensName: string;
                        aliasName: string;
                    }) => ({
                        ensName,
                        aliasName,
                        profile: (
                            await getUserProfile(provider, aliasName)
                        )?.profile,
                    }),
                ),
            );
            //Filter out users that have no profile
            const dm3Users = withAccounts.filter(
                (account: Account) => account.profile !== undefined,
            );

            //for every dm3User find every message

            const dm3UsersWithMessages = dm3Users.map((dm3User) => {
                const messages = haltedMessages.filter(
                    (message) =>
                        message.envelop.message.metadata.to === dm3User.ensName,
                );
                return { ...dm3User, messages };
            });

            //fetch the ds profiles of every recipient
            const withDsProfile = await Promise.all(
                dm3UsersWithMessages.map(async (dm3User) => ({
                    ...dm3User,
                    deliveryServiceProfiles: (
                        await fetchDsProfiles(provider, dm3User)
                    ).deliveryServiceProfiles,
                })),
            );

            const envelops = await Promise.all(
                withDsProfile.map((receiverAccount) => {
                    return Promise.all(
                        //Outer loop gets through every message
                        receiverAccount.messages.map((message) => {
                            return Promise.all(
                                //Inner loop gets through every ds profile
                                //messsage x dsProfile = envelops
                                receiverAccount.deliveryServiceProfiles.map(
                                    async (
                                        dsProfile: DeliveryServiceProfile,
                                    ) => {
                                        //build the dispatchable envelop containing the deliveryInformation of the receiver
                                        const dispatchableEnvelop =
                                            await buildEnvelop(
                                                message.envelop.message,
                                                (
                                                    publicKey: string,
                                                    msg: string,
                                                ) =>
                                                    encryptAsymmetric(
                                                        publicKey,
                                                        msg,
                                                    ),
                                                {
                                                    from: sendersAccount!,
                                                    to: receiverAccount!,
                                                    deliverServiceProfile:
                                                        dsProfile,
                                                    keys: profileKeys!,
                                                },
                                            );
                                        return {
                                            //To clear the envelop that has been used to store the halted message
                                            haltedEnvelopId: message.messageId,
                                            ...dispatchableEnvelop,
                                            //we keep the alias name for the receiver. In case it differes from the ensName
                                            aliasName:
                                                receiverAccount.aliasName,
                                        };
                                    },
                                ),
                            );
                        }),
                    );
                }),
            );
            //because we have a nested array we have to flatten it 2 times
            //The envelops are now ready to be disptched
            const dispatchableEnvelops = envelops.flat(2);

            await submitEnvelopsToReceiversDs(dispatchableEnvelops);

            // clear the halted messages as those are sent
            dispatchableEnvelops.map((envelop) => {
                clearHaltedMessages(envelop.haltedEnvelopId, envelop.aliasName);
            });
        };

        handleHaltedMessages();
    }, [storageInitialized]);

    return {};
};
