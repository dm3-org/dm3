import {
    AccountsType,
    Actions,
    GlobalState,
    RightViewSelected,
    UiViewStateType,
} from './enum-type-utils';
import profilePic from '../assets/images/profile-pic.jpg';
import { EnsProfileDetails } from '../interfaces/utils';
import { log } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { ENS_PROFILE_BASE_URL } from './common-utils';
import { ContactInfo } from '../interfaces/utils';

// method to get avatar/image url
export const getAvatar = async (
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
): Promise<string | null | undefined> => {
    return await provider.getAvatar(ensName);
};

// method to fetch, check and set avatar
export const getAvatarProfilePic = async (
    state: GlobalState,
    ensName: string,
): Promise<string> => {
    if (state.connection.provider && ensName) {
        const data = await getAvatar(state.connection.provider, ensName);
        return data ? data : profilePic;
    } else {
        return profilePic;
    }
};

// method to fetch ENS profile details like github, email and twitter
export const getEnsProfileDetails = async (
    state: GlobalState,
    ensName: string,
): Promise<EnsProfileDetails> => {
    let details: EnsProfileDetails = {
        email: null,
        github: null,
        twitter: null,
    };

    try {
        const provider = state.connection.provider;

        if (provider && ensName) {
            const resolver = await provider.getResolver(ensName);
            if (resolver) {
                details.email = await resolver.getText('email');
                details.github = await resolver.getText('com.github');
                details.twitter = await resolver.getText('com.twitter');
            }
        }

        return details;
    } catch (error) {
        log(error, 'Error in fetching ENS profile details');
        return details;
    }
};

// method to open ENS details in new tab
export const openEnsProfile = (ensName: string) => {
    window.open(ENS_PROFILE_BASE_URL + ensName, '_blank');
};

// method to hide contact from contact list
export const hideContact = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) => {
    // Body will be added when "Hide contact" task will be picked up
};

// method to close profile/contact info page
export const onClose = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: UiViewStateType.SetSelectedRightView,
        payload: RightViewSelected.Default,
    });
    dispatch({
        type: AccountsType.SetSelectedContact,
        payload: undefined,
    });
};

export const openProfileConfigureBox = (dispatch: React.Dispatch<Actions>) => {
    // Body will be added when "Configure profile" task will be picked up
};

// method to fetch selected contact
export const getContactSelected = async (
    state: GlobalState,
): Promise<ContactInfo | null> => {
    const key =
        state.accounts.selectedContact?.account.profile?.publicEncryptionKey;
    const name = state.accounts.selectedContact?.account.ensName;
    const cacheContacts = state.cache.contacts;

    if (cacheContacts) {
        const selectedAccount = cacheContacts.filter(
            (data) =>
                (key &&
                    data.contactDetails.account.profile?.publicEncryptionKey ===
                        key) ||
                name === data.contactDetails.account.ensName,
        );

        if (selectedAccount.length) {
            let address;
            const provider = state.connection.provider;

            try {
                address = await provider?.resolveName(
                    selectedAccount[0].contactDetails.account.ensName,
                );
            } catch (error) {
                address =
                    selectedAccount[0].contactDetails.account.ensName.split(
                        '.',
                    )[0];
            }

            const info: ContactInfo = {
                name: selectedAccount[0].contactDetails.account.ensName,
                address: address ? address : '',
                image: selectedAccount[0].image,
            };

            return info;
        }
    }
    return null;
};
