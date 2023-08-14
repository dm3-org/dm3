// method to open the preferences modal
export const openPreferencesModal = () => {
    const modal: HTMLElement = document.getElementById(
        'preferences-modal',
    ) as HTMLElement;
    modal.style.display = 'block';
};

// method to close the preferences modal
export const closePreferencesModal = () => {
    const modal: HTMLElement = document.getElementById(
        'preferences-modal',
    ) as HTMLElement;
    modal.style.display = 'none';
};
