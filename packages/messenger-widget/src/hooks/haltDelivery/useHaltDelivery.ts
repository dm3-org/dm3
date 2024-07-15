import { useContext, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { TLDContext } from '../../context/TLDContext';
import {
    Account,
    DeliveryServiceProfile,
    getUserProfile,
} from '@dm3-org/dm3-lib-profile';
import { MainnetProviderContext } from '../../context/ProviderContext';
import { DispatchableEnvelop, buildEnvelop } from '@dm3-org/dm3-lib-messaging';
import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { AuthContext } from '../../context/AuthContext';
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

            console.log('resolvedAliases', resolvedAliases);

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

            console.log('haltedMessages', dm3UsersWithMessages);

            console.log('withUserProfiles', withAccounts);
            console.log('dm3Users', dm3Users);
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
                                        //build the dispatchable envelop
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

            console.log('flat dispatchableenvelops', dispatchableEnvelops);

            await submitEnvelopsToReceiversDs(dispatchableEnvelops);

            dispatchableEnvelops.map((envelop) => {
                clearHaltedMessages(
                    envelop.envelop.metadata?.encryptedMessageHash!,
                    envelop.aliasName,
                );
            });

            //Clear messages after they have been dispatched
        };

        handleHaltedMessages();
    }, [storageInitialized]);

    return {};
};
