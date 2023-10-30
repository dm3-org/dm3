import { themeOne } from './theme-utils';

// Method to set styles in classes
export const setTheme = (theme: string | undefined | null) => {
    const themeDetails: any = selectTheme(theme);
    document.body.style.setProperty(
        '--base-background',
        themeDetails.baseBackground,
    );
    document.body.style.setProperty(
        '--background-container',
        themeDetails.backgroundContainer,
    );
    document.body.style.setProperty(
        '--normal-btn-border',
        themeDetails.normalBtnBorder,
    );
    document.body.style.setProperty(
        '--config-box-border',
        themeDetails.configBoxBorder,
    );
    document.body.style.setProperty('--normal-btn', themeDetails.normalBtn);
    document.body.style.setProperty(
        '--normal-btn-hover',
        themeDetails.normalBtnHover,
    );
    document.body.style.setProperty(
        '--normal-btn-inactive',
        themeDetails.normalBtnInactive,
    );
    document.body.style.setProperty(
        '--text-primary-color',
        themeDetails.textPrimary,
    );
    document.body.style.setProperty(
        '--text-secondary-color',
        themeDetails.textSecondary,
    );
    document.body.style.setProperty(
        '--background-active-contact',
        themeDetails.backgroundActiveContact,
    );
    document.body.style.setProperty(
        '--background-config-box',
        themeDetails.backgroundConfigBox,
    );
    document.body.style.setProperty(
        '--background-config-box-border',
        themeDetails.backgroundConfigBoxBorder,
    );
    document.body.style.setProperty(
        '--background-chat',
        themeDetails.chatBackground,
    );
    document.body.style.setProperty(
        '--disabled-btn-text',
        themeDetails.disabledBtnText,
    );
    document.body.style.setProperty('--error-text', themeDetails.textError);
    document.body.style.setProperty(
        '--error-background',
        themeDetails.errorBackground,
    );
    document.body.style.setProperty(
        '--attachment-background',
        themeDetails.attachmentBackground,
    );
};

// Method to get all css style class based on theme selected
export const selectTheme = (theme: string | undefined | null): object => {
    if (!theme) {
        return themeOne;
    }
    switch (theme) {
        case 'dark':
            return themeOne;
        default:
            return themeOne;
    }
};

// Updates the button style
export function changeButtonStyle(
    event: React.MouseEvent,
    classOne: string,
    classTwo: string,
) {
    event.currentTarget.classList.remove(classOne);
    event.currentTarget.classList.add(classTwo);
}
