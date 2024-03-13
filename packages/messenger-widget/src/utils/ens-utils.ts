import { globalConfig, log } from '@dm3-org/dm3-lib-shared';
import makeBlockie from 'ethereum-blockies-base64';
import { ethers } from 'ethers';
import humanIcon from '../assets/images/human.svg';
import { EnsProfileDetails } from '../interfaces/utils';
import {
    ENS_PROFILE_BASE_URL,
    MOBILE_SCREEN_WIDTH,
    getEtherscanUrl,
} from './common-utils';
import { Actions, RightViewSelected, UiViewStateType } from './enum-type-utils';

// method to get avatar/image url
export const getAvatar = async (
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
): Promise<string | null | undefined> => {
    return await provider.getAvatar(ensName);
};

// method to fetch, check and set avatar
export const getAvatarProfilePic = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    ensName: string,
) => {
    if (ensName) {
        const provider = mainnetProvider;
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
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    ensName: string,
): Promise<EnsProfileDetails> => {
    const details: EnsProfileDetails = {
        email: null,
        github: null,
        twitter: null,
    };

    try {
        const provider = mainnetProvider;

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
export const openEtherscan = (address: string, chainId: string) => {
    window.open(getEtherscanUrl(chainId) + address, '_blank');
};

// method to close profile/contact info page
export const onClose = (
    dispatch: React.Dispatch<Actions>,
    setSelectedContact: Function,
    screenWidth: number,
) => {
    if (screenWidth && screenWidth > MOBILE_SCREEN_WIDTH) {
        setSelectedContact(undefined);
        dispatch({
            type: UiViewStateType.SetSelectedRightView,
            payload: RightViewSelected.Default,
        });
    } else {
        dispatch({
            type: UiViewStateType.SetSelectedRightView,
            payload: RightViewSelected.Chat,
        });
    }
};

// method to check DM3 network profile on ENS
export const checkEnsDM3Text = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    ensName: string,
): Promise<boolean> => {
    try {
        const resolver = await mainnetProvider.getResolver(ensName);
        if (!resolver) {
            return false;
        }
        const data = await resolver.getText('network.dm3.profile');
        return data ? true : false;
    } catch (error) {
        log(error, 'Error in checking ENS DM3 profile ');
        return false;
    }
};
