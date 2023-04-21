import { StorageLocation } from 'dm3-lib-storage';
import { ConnectionState } from '../web3provider/Web3Provider';

export interface Config {
    defaultContact?: string;
    showContacts: boolean;
    inline: boolean;
    defaultStorageLocation: StorageLocation;
    hideStorageSelection: boolean;
    style: React.CSSProperties;
    defaultServiceUrl: string;
    showAlways: boolean;
    miniSignIn: boolean;
    connectionStateChange?: (
        newState: ConnectionState,
    ) => void;
    warnBeforeLeave: boolean;
    browserStorageBackup: boolean;
    showHelp: boolean;
}

const DefaultConfig: Config = {
    showContacts: true,
    inline: false,
    hideStorageSelection: false,
    defaultStorageLocation: StorageLocation.dm3Storage,
    style: {},
    defaultServiceUrl: 'http://localhost:8080' as string,
    showAlways: false,
    connectionStateChange: undefined,
    miniSignIn: false,
    warnBeforeLeave: false,
    browserStorageBackup: false,
    showHelp: false,
};

export function getConfig(overwrite: Partial<Config>): Config {
    return { ...DefaultConfig, ...overwrite };
}
