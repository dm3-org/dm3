import * as Lib from 'dm3-lib';

export interface Config {
    defaultContact?: string;
    showContacts: boolean;
    inline: boolean;
    defaultStorageLocation: Lib.storage.StorageLocation;
    hideStorageSelection: boolean;
    style: React.CSSProperties;
    defaultServiceUrl: string;
    showAlways: boolean;
    miniSignIn: boolean;
    connectionStateChange?: (
        newState: Lib.web3provider.ConnectionState,
    ) => void;
    warnBeforeLeave: boolean;
    browserStorageBackup: boolean;
    showHelp: boolean;
}

const DefaultConfig: Config = {
    showContacts: true,
    inline: false,
    hideStorageSelection: false,
    defaultStorageLocation: Lib.storage.StorageLocation.dm3Storage,
    style: {},
    defaultServiceUrl: 'http://localhost:8080' as string,
    showAlways: false,
    connectionStateChange: undefined,
    miniSignIn: false,
    warnBeforeLeave: false,
    browserStorageBackup: false,
    showHelp: true,
};

export function getConfig(overwrite: Partial<Config>): Config {
    return { ...DefaultConfig, ...overwrite };
}
