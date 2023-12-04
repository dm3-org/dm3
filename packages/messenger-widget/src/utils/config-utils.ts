import { StorageLocation } from 'dm3-lib-storage';
import { Config } from '../interfaces/config';

// The default configuration of the app
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
    theme: undefined,
    ethereumProvider: '' as string,
    walletConnectProjectId: '' as string,
    hideFunction: '',
};

export function getConfig(overwrite: Partial<Config>): Config {
    return { ...DefaultConfig, ...overwrite };
}
