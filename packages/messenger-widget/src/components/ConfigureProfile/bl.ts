export const PROFILE_INPUT_FIELD_CLASS =
    'profile-input font-weight-400 font-size-14 border-radius-6 w-100 line-height-24';

export const BUTTON_CLASS =
    'configure-btn font-weight-400 font-size-12 border-radius-4 line-height-24';

export enum NAME_TYPE {
    ENS_NAME,
    DM3_NAME,
}

export enum ACTION_TYPE {
    CONFIGURE,
    REMOVE,
}

// method to open the profile configuration modal
export const openConfigurationModal = () => {
    const modal: HTMLElement = document.getElementById(
        'configuration-modal',
    ) as HTMLElement;
    modal.style.display = 'block';
};

// method to close the profile configuration modal
export const closeConfigurationModal = () => {
    const modal: HTMLElement = document.getElementById(
        'configuration-modal',
    ) as HTMLElement;
    modal.style.display = 'none';
};
