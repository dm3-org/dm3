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
    showAlways: boolean;
    showContacts: boolean;
    nonce: string;
    publicVapidKey: string;
    hideFunction?: string;
    theme?: any;
    signInImage?: string;
    siwe?: Siwe;
}

export interface Dm3Props {
    config: DM3Configuration;
}

export interface Siwe {
    address: string;
    message: string;
    signature: string;
    secret: string;
}
