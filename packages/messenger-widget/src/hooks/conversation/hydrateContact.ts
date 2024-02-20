/* eslint-disable no-console */
import {
    Account,
    getAccountDisplayName,
    getDeliveryServiceProfile,
    getUserProfile,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { Conversation } from '@dm3-org/dm3-lib-storage/dist/new/types';
import axios from 'axios';
import { ethers } from 'ethers';
import { Contact } from '../../interfaces/context';
import { ContactPreview } from '../../interfaces/utils';
import { getAvatarProfilePic } from '../../utils/ens-utils';

export const hydrateContract = async (
    provider: ethers.providers.JsonRpcProvider,
    conversatoinManifest: Conversation,
    resolveAliasToTLD: (alias: string) => Promise<string>,
) => {
    const account = await fetchAccount(
        provider,
        conversatoinManifest.contactEnsName,
    );
    const contact = await fetchDsProfile(provider, account);
    const contactPreview = await fetchPreview(
        provider,
        conversatoinManifest,
        contact,
        resolveAliasToTLD,
    );

    return contactPreview;
};

const fetchPreview = async (
    provider: ethers.providers.JsonRpcProvider,
    conversatoinManifest: Conversation,
    contact: Contact,
    resolveAliasToTLD: (alias: string) => Promise<string>,
): Promise<ContactPreview> => {
    return {
        name: await resolveAliasToTLD(contact.account.ensName),
        message: '',
        image: await getAvatarProfilePic(provider, contact.account.ensName),
        messageCount: conversatoinManifest.messageCounter,
        unreadMsgCount: 21,
        contactDetails: contact,
        isHidden: conversatoinManifest.isHidden,
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
