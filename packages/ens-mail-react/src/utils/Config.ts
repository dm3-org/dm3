import * as Lib from 'ens-mail-lib';

export interface Config {
    defaultContact?: string;
    showContacts: boolean;
    inline: boolean;
    defaultStorageLocation: Lib.StorageLocation;
    hideStorageSelection: boolean;
    style: React.CSSProperties;
}

const DefaultConfig: Config = {
    showContacts: true,
    inline: false,
    defaultStorageLocation: Lib.StorageLocation.File,
    hideStorageSelection: false,
    style: {},
};

export function getConfig(overwrite: Partial<Config>): Config {
    return { ...DefaultConfig, ...overwrite };
}
