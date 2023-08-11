// method to open the preferences modal
export const openPreferencesModal = () => {
    let modal: HTMLElement = document.getElementById(
        'preferences-modal',
    ) as HTMLElement;
    modal.style.display = 'block';
};

// method to close the preferences modal
export const closePreferencesModal = () => {
    let modal: HTMLElement = document.getElementById(
        'preferences-modal',
    ) as HTMLElement;
    modal.style.display = 'none';
};
