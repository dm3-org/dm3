import { SendDependencies, Message } from 'dm3-lib-messaging';
import { Account, DeliveryServiceProfile, ProfileKeys } from 'dm3-lib-profile';
import { globalConfig, log } from 'dm3-lib-shared';
import { StorageEnvelopContainer } from 'dm3-lib-storage';
import { submitMessage } from '../adapters/messages';
import {
    GlobalState,
    Actions,
    UserDbType,
    LeftViewSelected,
    ModalStateType,
    UiViewStateType,
} from './enum-type-utils';
import { startLoader } from '../components/Loader/Loader';

// returns the file extension by extracting from base64
export const getFileTypeFromBase64 = (file: string): string => {
    return file.substring(file.indexOf('/') + 1, file.indexOf(';base64'));
};

// returns a temporary string as id
export const generateRandomStringForId = (): string => {
    return Math.random().toString(36).substring(2, 12);
};

// returns a temporary string as id
export const createNameForFile = (index: number, fileType: string): string => {
    return `file${index}`.concat('.', fileType.toLowerCase());
};

// method to open the error modal
export const openErrorModal = (
    message: string,
    action: boolean,
    method?: any,
    changeAccount?: boolean,
) => {
    const modal: HTMLElement = document.getElementById(
        'error-modal',
    ) as HTMLElement;
    modal.style.display = 'flex';

    const btn: HTMLElement = document.getElementById('ok-btn') as HTMLElement;

    // set error message on popup modal
    const data = document.getElementById('error-message') as HTMLElement;
    data.innerText = message;

    // if popup is already open then don't change any state
    if (btn.style.display === 'block') {
        return;
    }

    btn.style.display = 'block';

    // set error loader style on popup modal
    const errorLoader = document.getElementById(
        'error-modal-spinner',
    ) as HTMLElement;

    if (changeAccount) {
        errorLoader.classList.remove('error-modal-spinner');
        errorLoader.style.display = 'flex';
        setTimeout(() => {
            reloadApp();
        }, 2000);
    } else if (!action) {
        btn.onclick = function () {
            // on successful if condition, close the modal else clear local storage & reload the page
            if (method) {
                closeErrorModal();
            } else {
                clearStorage();
                reloadApp();
            }
        };
    } else {
        btn.onclick = async function () {
            errorLoader.classList.remove('error-modal-spinner');
            errorLoader.style.display = 'flex';
            await method();
            clearStorage();
            reloadApp();
        };
    }
};

// method to clear local storage related to wallet connection and reload page on error
export const clearStorage = () => {
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('rk-version');
    localStorage.removeItem('wc@2:core:0.3//keychain');
    localStorage.removeItem('WCM_VERSION');
    localStorage.removeItem('wagmi.cache');
    localStorage.removeItem('wagmi.metaMask.shimDisconnect');
    localStorage.removeItem('wagmi.wallet');
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('rk-recent');
};

export const reloadApp = () => {
    window.location.reload();
};

// method to close the error modal
export const closeErrorModal = () => {
    const modal: HTMLElement = document.getElementById(
        'error-modal',
    ) as HTMLElement;
    modal.style.display = 'none';
    const data = document.getElementById('error-message') as HTMLElement;
    data.innerText = '';
};

export const getHaltDelivery = (state: GlobalState): boolean => {
    if (state.cache.contacts) {
        const contacts = state.cache.contacts.filter(
            (data) =>
                data.contactDetails.account.ensName ===
                state.accounts.selectedContact?.account.ensName,
        );
        if (contacts.length) {
            return contacts[0].contactDetails.account.profile
                ?.publicEncryptionKey &&
                contacts[0].contactDetails.account?.profile?.publicEncryptionKey
                ? false
                : true;
        } else {
            return true;
        }
    } else {
        return true;
    }
};

export const getDependencies = (state: GlobalState): SendDependencies => {
    const data = {
        deliverServiceProfile:
            state.accounts.selectedContact?.deliveryServiceProfile!,
        from: state.connection.account!,
        to: state.accounts.selectedContact?.account as Account,
        keys: state.userDb?.keys as ProfileKeys,
    };
    if (state.cache.contacts) {
        const contacts = state.cache.contacts.filter(
            (data) =>
                data.contactDetails.account.ensName ===
                state.accounts.selectedContact?.account.ensName,
        );
        if (contacts.length) {
            data.deliverServiceProfile = contacts[0].contactDetails
                .deliveryServiceProfile as DeliveryServiceProfile;
            data.to = contacts[0].contactDetails.account;
        }
    }
    return data;
};

export const sendMessage = async (
    state: GlobalState,
    sendDependencies: SendDependencies,
    messageData: Message,
    haltDelivery: boolean,
    dispatch: React.Dispatch<Actions>,
) => {
    try {
        await submitMessage(
            state.connection,
            state.auth.currentSession?.token!,
            sendDependencies,
            messageData,
            haltDelivery,
            (envelops: StorageEnvelopContainer[]) =>
                envelops.forEach((envelop) =>
                    dispatch({
                        type: UserDbType.addMessage,
                        payload: {
                            container: envelop,
                            connection: state.connection,
                        },
                    }),
                ),
        );
    } catch (e) {
        log('[handleNewUserMessage] ' + JSON.stringify(e), 'error');
    }
};

export const showContactList = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: ModalStateType.LoaderContent,
        payload: 'Fetching contacts...',
    });
    startLoader();
    dispatch({
        type: UiViewStateType.SetSelectedLeftView,
        payload: LeftViewSelected.Contacts,
    });
};

export const getLastDm3Name = (nameList: string[]) => {
    let index = -1;
    index = nameList.findIndex((data) =>
        data.endsWith(globalConfig.USER_ENS_SUBDOMAIN()),
    );
    return index > -1 ? nameList[index] : null;
};

// Constants
export const REACT_APP_SUPPORTED_CHAIN_ID = 5;

/*  eslint-disable */
export const INVALID_NETWORK_POPUP_MESSAGE =
    'Invalid network selected. Please click OK and sign in again to continue using DM3 chat with Ethereum main network!';

export const ACCOUNT_CHANGE_POPUP_MESSAGE =
    'Please sign in with the new account selected to use DM3 app!';

export const ENS_PROFILE_BASE_URL = 'https://app.ens.domains/';

export const ETHERSCAN_URL = 'https://goerli.etherscan.io/address/';
