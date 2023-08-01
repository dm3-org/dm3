// method to open the error modal
export const openErrorModal = (
    message: string,
    action: boolean,
    method?: any,
) => {
    let modal: any = document.getElementById('error-modal') as HTMLElement;
    modal.style.display = 'flex';

    let btn: any = document.getElementById('ok-btn') as HTMLElement;

    // if popup is already open then don't change any state
    if (btn.style.display === 'block') {
        return;
    }

    btn.style.display = 'block';

    // set error message on popup modal
    let data = document.getElementById('error-message') as HTMLElement;
    data.innerText = message;

    // set error loader style on popup modal
    let errorLoader = document.getElementById(
        'error-modal-spinner',
    ) as HTMLElement;

    if (!action) {
        btn.onclick = function () {
            clearStorageAndReload();
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

// method to clear local storage and reload page on error
const clearStorageAndReload = () => {
    localStorage.clear();
    window.location.reload();
};

// method to close the error modal
export const closeErrorModal = () => {
    let modal: any = document.getElementById('error-modal');
    modal.style.display = 'none';
    let data = document.getElementById('error-message') as HTMLElement;
    data.innerText = '';
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
