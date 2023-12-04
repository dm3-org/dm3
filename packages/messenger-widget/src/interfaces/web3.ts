import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { StorageLocation } from 'dm3-lib-storage';
import { Account } from 'dm3-lib-profile';
import { ConnectionState } from '../utils/enum-type-utils';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface Connection {
    connectionState: ConnectionState;
    ethAddress?: string;
    account?: Account;
    provider?: ethers.providers.JsonRpcProvider;
    mainnetProvider: ethers.providers.JsonRpcProvider;
    socket?: Socket<DefaultEventsMap, DefaultEventsMap>;
    storageToken?: string;
    storageLocation: StorageLocation;
    defaultServiceUrl: string;
}

export interface SignInProps {
    hideStorageSelection: boolean;
    miniSignIn: boolean;
    defaultStorageLocation: StorageLocation | undefined;
}
