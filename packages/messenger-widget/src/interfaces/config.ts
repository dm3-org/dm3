export interface Config {
    defaultContact?: string;
    showContacts: boolean;
    inline: boolean;
    defaultStorageLocation: any;
    hideStorageSelection: boolean;
    style: React.CSSProperties;
    defaultServiceUrl: string;
    showAlways: boolean;
    miniSignIn: boolean;
    connectionStateChange?: (newState: any) => void;
    warnBeforeLeave: boolean;
    browserStorageBackup: boolean;
    showHelp: boolean;
    theme: string | undefined | null;
    ethereumProvider: string;
    walletConnectProjectId: string;
    hideFunction?: string;
    signInImage?: string;
}

export interface Dm3Props {
    config: Config;
}
