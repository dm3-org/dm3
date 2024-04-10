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
    genomeRegistryAddress: string;
    showAlways: boolean;
    showContacts: boolean;
    hideFunction?: string;
    theme?: any;
    signInImage?: string;
}

export interface Dm3Props {
    config: DM3Configuration;
}
