import { log } from '@dm3-org/dm3-lib-shared';
import makeBlockie from 'ethereum-blockies-base64';
import { ethers } from 'ethers';
import humanIcon from '../assets/images/human.svg';
import { EnsProfileDetails } from '../interfaces/utils';
import {
    AVATAR_IPFS_URL_PREFIX,
    ENS_PROFILE_BASE_URL,
    MOBILE_SCREEN_WIDTH,
    getEtherscanUrl,
} from './common-utils';
import { RightViewSelected } from './enum-type-utils';
import axios from 'axios';

const isImageLoadable = async (url: string): Promise<boolean> => {
    try {
        const { status } = await axios.get(url);
        return status === 200;
    } catch (error) {
        console.log('error in loading image : ', error);
        return false;
    }
};

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
    addrEnsSubdomain: string,
) => {
    if (ensName) {
        const provider = mainnetProvider;
        try {
            if (provider) {
                const resolver = await provider.getResolver(ensName);
                if (resolver) {
                    const avatar = await resolver
                        .getText('avatar')
                        .catch(() => null);
                    if (avatar) {
                        /**
                         * If the image URL is of IPFS, then it can't be directly loaded by
                         * the browser, so trim the URL and create a proper IPFS url so that
                         * image can be rendered. Example :-
                         * Original URL fetched : ipfs://QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE (not loadable in browser)
                         * Modified URL : https://ipfs.euc.li/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE  (loadable in browser)
                         */
                        const splittedIpfsUrl = avatar.split('ipfs://');
                        const imageUrl =
                            splittedIpfsUrl.length === 2
                                ? AVATAR_IPFS_URL_PREFIX.concat(
                                      splittedIpfsUrl[1],
                                  )
                                : avatar;
                        if (await isImageLoadable(imageUrl)) {
                            return imageUrl;
                        }
                    }
                }
                const address = await provider.resolveName(ensName);
                if (address) {
                    const pic = makeBlockie(address);
                    return pic ? (pic as string) : (humanIcon as string);
                } else if (ensName.endsWith(addrEnsSubdomain)) {
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
    setSelectedRightView: (view: RightViewSelected) => void,
    setSelectedContact: Function,
    screenWidth: number,
    showContacts: boolean,
) => {
    // If contact list exists, then opens default screen
    if (screenWidth && screenWidth > MOBILE_SCREEN_WIDTH && showContacts) {
        setSelectedContact(undefined);
        setSelectedRightView(RightViewSelected.Default);
        return;
    }
    setSelectedRightView(RightViewSelected.Chat);
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
