import { SendDependencies, Message } from 'dm3-lib-messaging';
import { Account, ProfileKeys } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
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
) => {
    const modal: HTMLElement = document.getElementById(
        'error-modal',
    ) as HTMLElement;
    modal.style.display = 'flex';

    const btn: HTMLElement = document.getElementById('ok-btn') as HTMLElement;

    // if popup is already open then don't change any state
    if (btn.style.display === 'block') {
        return;
    }

    btn.style.display = 'block';

    // set error message on popup modal
    const data = document.getElementById('error-message') as HTMLElement;
    data.innerText = message;

    // set error loader style on popup modal
    const errorLoader = document.getElementById(
        'error-modal-spinner',
    ) as HTMLElement;

    if (!action) {
        btn.onclick = function () {
            // on successful if condition, close the modal else clear local storage & reload the page
            if (method) closeErrorModal();
            else clearStorageAndReload();
        };
    } else {
        btn.onclick = async function () {
            errorLoader.classList.remove('error-modal-spinner');
            errorLoader.style.display = 'flex';
            await method();
            clearStorageAndReload();
        };
    }
};

// method to clear local storage related to wallet connection and reload page on error
const clearStorageAndReload = () => {
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('rk-version');
    localStorage.removeItem('wc@2:core:0.3//keychain');
    localStorage.removeItem('WCM_VERSION');
    localStorage.removeItem('wagmi.cache');
    localStorage.removeItem('wagmi.metaMask.shimDisconnect');
    localStorage.removeItem('wagmi.wallet');
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('rk-recent');
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
    return state.accounts.selectedContact?.account.profile
        ?.publicEncryptionKey &&
        state.connection.account?.profile?.publicEncryptionKey
        ? false
        : true;
};

export const getDependencies = (state: GlobalState): SendDependencies => {
    return {
        deliverServiceProfile:
            state.accounts.selectedContact?.deliveryServiceProfile!,
        from: state.connection.account!,
        to: state.accounts.selectedContact?.account as Account,
        keys: state.userDb?.keys as ProfileKeys,
    };
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

// Constants
export const REACT_APP_SUPPORTED_CHAIN_ID = 1;

/*  eslint-disable */
export const INVALID_NETWORK_POPUP_MESSAGE =
    'Invalid network selected. Please click OK and sign in again to continue using DM3 chat with Ethereum main network!';

export const INVALID_SESSION_POPUP_MESSAGE =
    'Seems your previous session is not closed properly. Please click OK to disconnect and sign in again to enjoy DM3 chatting!';

export const ACCOUNT_CHANGE_POPUP_MESSAGE =
    'Please sign in with the new account selected to use DM3 app!';

export const ENS_PROFILE_BASE_URL = 'https://app.ens.domains/';
