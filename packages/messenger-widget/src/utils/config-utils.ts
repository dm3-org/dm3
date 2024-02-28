import { Config } from '../interfaces/config';
import { signInImage } from '../assets/base64/home-image';

// The default configuration of the app
const DefaultConfig: Config = {
    showContacts: true,
    inline: false,
    hideStorageSelection: false,
    defaultStorageLocation: undefined,
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
    signInImage: signInImage,
};

export function getConfig(overwrite: Partial<Config>): Config {
    return { ...DefaultConfig, ...overwrite };
}
