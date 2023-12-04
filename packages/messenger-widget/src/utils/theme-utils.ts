export const defaultTheme: any = {
    backgroundContainer: '#1A1B22',
    normalBtnBorder: '2px solid #544393',
    configBoxBorder: '1px solid white',
    normalBtn: '#28204A',
    normalBtnHover: '#544393',
    normalBtnInactive: '#2A2B38',
    textPrimary: '#FFFF',
    textSecondary: '#81828D',
    backgroundActiveContact: 'linear-gradient(-259deg, #544393, #1f2029)',
    backgroundConfigBox: '#3A3C50',
    backgroundConfigBoxBorder: '1px solid #666876',
    chatBackground: '#1F2029',
    disabledBtnText: '#666876',
    textError: '#C30F1A',
    errorBackground: '#830B12',
    attachmentBackground: '#202129',
};

export const getCustomizedTheme = (themeCss: any) => {
    return {
        backgroundContainer:
            themeCss.backgroundColor ?? defaultTheme.backgroundContainer,
        normalBtnBorder: themeCss.buttonBorderColor
            ? `2px solid ${themeCss.buttonBorderColor}`
            : defaultTheme.normalBtnBorder,
        configBoxBorder: themeCss.configBoxBorderColor
            ? `1px solid ${themeCss.configBoxBorderColor}`
            : defaultTheme.configBoxBorder,
        normalBtn: themeCss.buttonColor ?? defaultTheme.normalBtn,
        normalBtnHover:
            themeCss.hoverButtonColor ?? defaultTheme.normalBtnHover,
        normalBtnInactive:
            themeCss.inactiveButtonColor ?? defaultTheme.normalBtnInactive,
        textPrimary: themeCss.primaryTextColor ?? defaultTheme.textPrimary,
        textSecondary:
            themeCss.secondaryTextColor ?? defaultTheme.textSecondary,
        backgroundActiveContact:
            themeCss.activeContactBackgroundColor ??
            defaultTheme.backgroundActiveContact,
        backgroundConfigBox:
            themeCss.configurationBoxBackgroundColor ??
            defaultTheme.backgroundConfigBox,
        backgroundConfigBoxBorder: themeCss.configurationBoxBorderColor
            ? `1px solid ${themeCss.configurationBoxBorderColor}`
            : defaultTheme.backgroundConfigBoxBorder,
        chatBackground:
            themeCss.chatBakgroundColor ?? defaultTheme.chatBackground,
        disabledBtnText:
            themeCss.disabledButtonTextColor ?? defaultTheme.disabledBtnText,
        textError: themeCss.errorTextColor ?? defaultTheme.textError,
        errorBackground:
            themeCss.errorBackgroundColor ?? defaultTheme.errorBackground,
        attachmentBackground:
            themeCss.attachmentBackgroundColor ??
            defaultTheme.attachmentBackground,
    };
};
