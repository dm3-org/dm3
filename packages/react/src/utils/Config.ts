import * as Lib from 'dm3-lib';

export interface Config {
    defaultContact?: string;
    showContacts: boolean;
    inline: boolean;
    defaultStorageLocation: Lib.StorageLocation;
    hideStorageSelection: boolean;
    style: React.CSSProperties;
    defaultServiceUrl: string;
    showAlways: boolean;
    miniSignIn: boolean;
    connectionStateChange?: (newState: Lib.ConnectionState) => void;
    warnBeforeLeave: boolean;
    browserStorageBackup: boolean;
}

const DefaultConfig: Config = {
    showContacts: true,
    inline: false,
    hideStorageSelection: false,
    defaultStorageLocation: Lib.StorageLocation.dm3Storage,
    style: {},
    defaultServiceUrl: process.env.REACT_APP_BACKEND as string,
    showAlways: false,
    connectionStateChange: undefined,
    miniSignIn: false,
    warnBeforeLeave: false,
    browserStorageBackup: false,
};

export function getConfig(overwrite: Partial<Config>): Config {
    return { ...DefaultConfig, ...overwrite };
}
