export interface DM3Configuration {
    defaultContact: string;
    defaultServiceUrl: string;
    ethereumProvider: string;
    walletConnectProjectId: string;
    userEnsSubdomain: string;
    addressEnsSubdomain: string;
    resolverBackendUrl: string;
    profileBaseUrl: string;
    defaultDeliveryService: string;
    backendUrl: string;
    chainId: string;
    resolverAddress: string;
    showAlways: boolean;
    showContacts: boolean;
    hideFunction?: string;
    theme?: any;
    signInImage?: string;
}

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
    dm3Configuration: DM3Configuration;
}
