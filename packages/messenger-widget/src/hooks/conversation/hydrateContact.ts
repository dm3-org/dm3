import {
    Account,
    DeliveryServiceProfile,
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
    //If the profile property of the account is defined the user has already used DM3 previously
    const account = await fetchAccount(
        provider,
        conversatoinManifest.contactEnsName,
    );
    //Has to become fetchMultipleDsProfiles
    const contact = await fetchDsProfiles(provider, account);

    //Fetch the message size limit of the receivers delivery service must be fetched for every message
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
        //display name, if alias is not defined the addr ens name will be used
        name: await resolveAliasToTLD(contact.account.ensName),
        message: '',
        image: await getAvatarProfilePic(
            provider,
            contact.account.ensName,
            addrEnsSubdomain,
        ),
        //ToDo maybe can be removed aswell
        messageCount: conversatoinManifest.messageCounter,
        //ToDo field is not used and can be removed
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

const fetchDsProfiles = async (
    provider: ethers.providers.JsonRpcProvider,
    account: Account,
): Promise<Contact> => {
    const deliveryServiceEnsNames = account.profile?.deliveryServices ?? [];
    if (deliveryServiceEnsNames.length === 0) {
        //If there is now DS profile the message will be storaged at the client side until they recipient has createed an account
        console.log(
            '[fetchDeliverServicePorfile] Cant resolve deliveryServiceEnsName',
        );
        return {
            account,
            deliveryServiceProfiles: [],
        };
    }

    //Resolve every ds profile in the contacts profile
    const dsProfilesWithUnknowns = await Promise.all(
        deliveryServiceEnsNames.map((deliveryServiceEnsName: string) => {
            console.log('fetch ds profile of', deliveryServiceEnsName);
            return getDeliveryServiceProfile(
                deliveryServiceEnsName,
                provider!,
                async (url: string) => (await axios.get(url)).data,
            );
        }),
    );
    //filter unknown profiles. A profile if unknown if the profile could not be fetched. We don't want to deal with them in the UI
    const deliveryServiceProfiles = dsProfilesWithUnknowns.filter(
        (profile): profile is DeliveryServiceProfile => profile !== undefined,
    );

    return {
        account,
        deliveryServiceProfiles,
    };
};
