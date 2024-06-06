/* eslint-disable no-console */
import {
    Account,
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
import { fetchMessageSizeLimit } from '../messages/sizeLimit/fetchSizeLimit';
import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';

export const hydrateContract = async (
    provider: ethers.providers.JsonRpcProvider,
    conversatoinManifest: Conversation,
    resolveAliasToTLD: (alias: string) => Promise<string>,
    addrEnsSubdomain: string,
    deliveryServiceProperties: DeliveryServiceProperties[],
) => {
    const account = await fetchAccount(
        provider,
        conversatoinManifest.contactEnsName,
    );
    const contact = await fetchDsProfile(provider, account);
    const messageSizeLimit = await fetchMessageSizeLimit(
        deliveryServiceProperties,
    );
    const contactPreview = await fetchPreview(
        provider,
        conversatoinManifest,
        contact,
        resolveAliasToTLD,
        messageSizeLimit,
        addrEnsSubdomain,
    );

    return contactPreview;
};

const fetchPreview = async (
    provider: ethers.providers.JsonRpcProvider,
    conversatoinManifest: Conversation,
    contact: Contact,
    resolveAliasToTLD: (alias: string) => Promise<string>,
    messageSizeLimit: number,
    addrEnsSubdomain: string,
): Promise<ContactPreview> => {
    return {
        name: await resolveAliasToTLD(contact.account.ensName),
        message: '',
        image: await getAvatarProfilePic(
            provider,
            contact.account.ensName,
            addrEnsSubdomain,
        ),
        messageCount: conversatoinManifest.messageCounter,
        unreadMsgCount: 21,
        contactDetails: contact,
        isHidden: conversatoinManifest.isHidden,
        messageSizeLimit: messageSizeLimit,
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
    const deliveryServiceEnsName = account.profile?.deliveryServices[0];
    if (!deliveryServiceEnsName) {
        //If there is now DS profile the message will be storaged at the client side until they recipient has createed an account
        console.log(
            '[fetchDeliverServicePorfile] Cant resolve deliveryServiceEnsName',
        );
        return {
            account,
        };
    }

    const deliveryServiceProfile = await getDeliveryServiceProfile(
        deliveryServiceEnsName,
        provider!,
        async (url: string) => (await axios.get(url)).data,
    );

    return {
        account,
        deliveryServiceProfile,
    };
};
