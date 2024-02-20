import { getCustomizedTheme, defaultTheme } from './theme-utils';

// Method to set styles in classes
export const setTheme = (theme: string | undefined | null) => {
    const themeDetails: any = selectTheme(theme);
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
    document.body.style.setProperty(
        '--selected-contact-border-color',
        themeDetails.selectedContactBorderColor,
    );
    document.body.style.setProperty(
        '--profile-configuration-text-color',
        themeDetails.profileConfigurationTextColor,
    );
    document.body.style.setProperty(
        '--received-message-background-color',
        themeDetails.receivedMessageBackgroundColor,
    );
    document.body.style.setProperty(
        '--received-message-text-color',
        themeDetails.receivedMessageTextColor,
    );
    document.body.style.setProperty(
        '--sent-message-background-color',
        themeDetails.sentMessageBackgroundColor,
    );
    document.body.style.setProperty(
        '--sent-message-text-color',
        themeDetails.sentMessageTextColor,
    );
    document.body.style.setProperty(
        '--info-box-background-color',
        themeDetails.infoBoxBackgroundColor,
    );
    document.body.style.setProperty(
        '--info-box-text-color',
        themeDetails.infoBoxTextColor,
    );
    document.body.style.setProperty(
        '--button-shadow',
        themeDetails.buttonShadow,
    );
    document.body.style.setProperty(
        '--msg-counter-background-color',
        themeDetails.msgCounterBackgroundColor,
    );
    document.body.style.setProperty(
        '--msg-counter-text-color',
        themeDetails.msgCounterTextColor,
    );
    document.body.style.setProperty(
        '--scrollbar-background-color',
        themeDetails.scrollbarBackgroundColor,
    );
    document.body.style.setProperty(
        '--scrollbar-scroller-color',
        themeDetails.scrollbarScrollerColor,
    );
    document.body.style.setProperty(
        '--input-field-background-color',
        themeDetails.inputFieldBackgroundColor,
    );
    document.body.style.setProperty(
        '--input-field-text-color',
        themeDetails.inputFieldTextColor,
    );
    document.body.style.setProperty(
        '--input-field-border-color',
        themeDetails.inputFieldBorderColor,
    );
    document.body.style.setProperty(
        '--emoji-modal-background-color',
        themeDetails.emojiModalBackgroundColor,
    );
    document.body.style.setProperty(
        '--emoji-modal-text-color',
        themeDetails.emojiModalTextColor,
    );
    document.body.style.setProperty(
        '--emoji-modal-accent-color',
        themeDetails.emojiModalAccentColor,
    );
    document.body.style.setProperty(
        '--rainbow-connect-btn-background-color',
        themeDetails.rainbowConnectBtnBackgroundColor,
    );
    document.body.style.setProperty(
        '--rainbow-connect-btn-text-color',
        themeDetails.rainbowConnectBtnTextColor,
    );
    document.body.style.setProperty(
        '--rainbow-accent-color',
        themeDetails.rainbowAccentColor,
    );
    document.body.style.setProperty(
        '--rainbow-accent-foreground-color',
        themeDetails.rainbowAccentForegroundColor,
    );
    document.body.style.setProperty(
        '--rainbow-modal-text-color',
        themeDetails.rainbowModalTextColor,
    );
    document.body.style.setProperty(
        '--rainbow-modal-text-secondary-color',
        themeDetails.rainbowModalTextSecondaryColor,
    );
    document.body.style.setProperty(
        '--rainbow-modal-background-color',
        themeDetails.rainbowModalBackgroundColor,
    );
    document.body.style.setProperty(
        '--rainbow-modal-wallet-hover-color',
        themeDetails.rainbowModalWalletHoverColor,
    );
};

// Method to get all css style class based on theme selected
export const selectTheme = (theme: any | undefined | null): object => {
    if (!theme) {
        return defaultTheme;
    } else {
        return getCustomizedTheme(theme);
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
