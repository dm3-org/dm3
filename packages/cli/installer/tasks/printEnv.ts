import { logInfo } from '@dm3-org/dm3-lib-shared';
import { InstallerArgs } from '../types';
import {
    DeliveryServiceProfile,
    DeliveryServiceProfileKeys,
    ProfileKeys,
} from '@dm3-org/dm3-lib-profile';

export const printEnv = (
    args: InstallerArgs,
    profileKeys: DeliveryServiceProfileKeys,
) => {
    // eslint-disable-next-line no-console
    console.log(
        'To setup your onw delivery service, you need to set the following environment variables:',
    );
    // eslint-disable-next-line no-console
    console.log(`RPC = ${args.rpc} `);
    // eslint-disable-next-line no-console
    console.log(
        `ENCRYPTION_PRIVATE_KEY = ${profileKeys.encryptionKeyPair.privateKey}`,
    );
    // eslint-disable-next-line no-console
    console.log(
        `ENCRYPTION_PUBLIC_KEY = ${profileKeys.encryptionKeyPair.publicKey}`,
    );
    // eslint-disable-next-line no-console
    console.log(
        `SIGNING_PRIVATE_KEY = ${profileKeys.signingKeyPair.privateKey}`,
    );
    // eslint-disable-next-line no-console
    console.log(`SIGNING_PUBLIC_KEY = ${profileKeys.signingKeyPair.publicKey}`);
};
