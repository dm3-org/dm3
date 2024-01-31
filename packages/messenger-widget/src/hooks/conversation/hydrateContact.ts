/* eslint-disable no-console */
import {
    Account,
    getAccountDisplayName,
    getDeliveryServiceProfile,
    getUserProfile,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import axios from 'axios';
import { ethers } from 'ethers';
import { Contact } from '../../interfaces/context';
import { ContactPreview } from '../../interfaces/utils';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import { GetMessages, GetNumberOfMessages } from '../storage/useStorage';
import { Envelop } from '@dm3-org/dm3-lib-messaging';
import { MessageActionType } from '../../utils/enum-type-utils';
import { StorageEnvelopContainer } from '@dm3-org/dm3-lib-storage';

export const hydrateContract = async (
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
    getMessages: GetMessages,
    getNumberOfMessages: GetNumberOfMessages,
) => {
    const account = await fetchAccount(provider, ensName);
    const contact = await fetchDsProfile(provider, account);
    const contactPreview = await fetchPreview(
        provider,
        contact,
        getMessages,
        getNumberOfMessages,
    );

    return contactPreview;
};

const fetchPreview = async (
    provider: ethers.providers.JsonRpcProvider,
    contact: Contact,
    getMessages: GetMessages,
    getNumberOfMessages: GetNumberOfMessages,
): Promise<ContactPreview> => {
    const MAX_MESSAGES_PER_CHUNK = 100;
    const numberOfmessages = await getNumberOfMessages(contact.account.ensName);
    const lastMessages = await getMessages(
        contact.account.ensName,
        Math.floor(numberOfmessages / MAX_MESSAGES_PER_CHUNK),
    );

    const lastMessage = lastMessages.filter(
        ({ envelop }: StorageEnvelopContainer) => {
            //Only consider NEW mesages for preview
            //TODO @Heiko double check pls
            return envelop.message.metadata?.type === MessageActionType.NEW;
        },
    )[lastMessages.length - 1]?.envelop?.message.message;

    //If there is no message to preview we use the empty string
    const messagePreview = lastMessage ?? '';

    console.log('last message', lastMessage);
    return {
        name: getAccountDisplayName(contact.account.ensName, 25),
        message: messagePreview,
        image: await getAvatarProfilePic(provider, contact.account.ensName),
        unreadMsgCount: 21,
        contactDetails: contact,
        isHidden: false,
    };
};

const fetchAccount = async (
    provider: ethers.providers.JsonRpcProvider,
    contact: string,
): Promise<Account> => {
    //At first we've to normalize the ENS names
    const normalizedContractName = normalizeEnsName(contact);

    //Then we've to fetch the UserProfile
    try {
        const userProfile = await getUserProfile(
            provider!,
            normalizedContractName,
        );
        return {
            ensName: normalizedContractName,
            profileSignature: userProfile?.signature,
            profile: userProfile?.profile,
        };
    } catch (err) {
        console.log('unable to fetch user profile for ', contact);
        return {
            ensName: normalizedContractName,
            profileSignature: undefined,
            profile: undefined,
        };
    }
};

const fetchDsProfile = async (
    provider: ethers.providers.JsonRpcProvider,
    account: Account,
): Promise<Contact> => {
    const deliveryServiceUrl = account.profile?.deliveryServices[0];

    if (!deliveryServiceUrl) {
        console.log(
            '[fetchDeliverServicePorfile] Cant resolve deliveryServiceUrl',
        );
        return {
            account,
        };
    }

    const deliveryServiceProfile = await getDeliveryServiceProfile(
        deliveryServiceUrl,
        provider!,
        async (url: string) => (await axios.get(url)).data,
    );

    return {
        account,
        deliveryServiceProfile,
    };
};
