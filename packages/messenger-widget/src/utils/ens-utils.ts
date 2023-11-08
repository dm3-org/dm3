import {
    AccountsType,
    Actions,
    GlobalState,
    ModalStateType,
    RightViewSelected,
    UiViewStateType,
    UserDbType,
} from './enum-type-utils';
import humanIcon from '../assets/images/human.svg';
import { EnsProfileDetails } from '../interfaces/utils';
import { globalConfig, log } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { ENS_PROFILE_BASE_URL, ETHERSCAN_URL } from './common-utils';
import { IContactInfo } from '../interfaces/utils';
import makeBlockie from 'ethereum-blockies-base64';

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
) => {
    if (state.connection.provider && ensName) {
        const provider = state.connection.provider;
        try {
            if (provider) {
                const address = await provider.resolveName(ensName);
                if (address) {
                    const pic = makeBlockie(address);
                    return pic ? (pic as string) : (humanIcon as string);
                } else if (
                    ensName.endsWith(globalConfig.ADDR_ENS_SUBDOMAIN())
                ) {
                    const pic = makeBlockie(ensName.split('.')[0]);
                    return pic ? (pic as string) : (humanIcon as string);
                } else {
                    return humanIcon;
                }
            } else {
                return humanIcon;
            }
        } catch (error) {
            return humanIcon;
        }
    } else {
        return humanIcon;
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

// method to open etherscan in new tab
export const openEtherscan = (address: string) => {
    window.open(ETHERSCAN_URL + address, '_blank');
};

// method to hide contact from contact list
export const hideContact = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) => {
    const ensName = state.accounts.selectedContact?.account.ensName;

    if (ensName) {
        dispatch({
            type: ModalStateType.ContactToHide,
            payload: ensName,
        });
        dispatch({
            type: UserDbType.hideContact,
            payload: {
                ensName: ensName,
            },
        });
        dispatch({
            type: UiViewStateType.SetSelectedRightView,
            payload: RightViewSelected.Default,
        });
        dispatch({
            type: AccountsType.SetSelectedContact,
            payload: undefined,
        });
    }
};

// method to close profile/contact info page
export const onClose = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: AccountsType.SetSelectedContact,
        payload: undefined,
    });
    dispatch({
        type: UiViewStateType.SetSelectedRightView,
        payload: RightViewSelected.Default,
    });
};

// method to fetch selected contact
export const getContactSelected = async (
    state: GlobalState,
): Promise<IContactInfo | null> => {
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
            } catch (error) {}

            if (!address) {
                address =
                    selectedAccount[0].contactDetails.account.ensName.split(
                        '.',
                    )[0];
                address = ethers.utils.isAddress(address) ? address : 'Not set';
            }

            const info: IContactInfo = {
                name: selectedAccount[0].contactDetails.account.ensName,
                address: address ? address : '',
                image: selectedAccount[0].image,
            };
            return info;
        }
    }
    return null;
};
