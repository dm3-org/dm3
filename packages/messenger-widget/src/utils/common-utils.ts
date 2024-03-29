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

// Method to close 3 dot icon menu to in mobile screen
export const closeContactMenu = () => {
    const menu = document.querySelector('.dropdown-content');
    if (menu) {
        menu.classList.remove('menu-details-dropdown-content');
    }
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

export const getEtherscanUrl = (chainId: string): string => {
    return chainId === '1'
        ? 'https://etherscan.io/address/'
        : 'https://sepolia.etherscan.io/address/';
};

// method to open URL in new tab
export const openUrlInNewTab = (url: string) => {
    window.open(url, '_blank');
};

// Constants
export const REACT_APP_SUPPORTED_CHAIN_IDS = [5, 10200];

/*  eslint-disable */
export const INVALID_NETWORK_POPUP_MESSAGE =
    'Invalid network selected. Please click OK and sign in again to continue using DM3 chat with Ethereum main network!';

export const ACCOUNT_CHANGE_POPUP_MESSAGE =
    'Your wallet address has changed. Please re-sign in with a signature of your wallet.';

export const ENS_PROFILE_BASE_URL = 'https://app.ens.domains/';

export const MOBILE_SCREEN_WIDTH = 800;
