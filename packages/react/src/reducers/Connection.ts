import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ActionMap } from './shared';
import { StorageLocation } from 'dm3-lib-storage';
import { Account } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
import { Connection, ConnectionState } from '../web3provider/Web3Provider';

export enum ConnectionType {
    ChangeConnectionState = 'CHANGE_CONNECTION_STATE',
    ChangeSocket = 'CHANGE_SOCKET',
    ChangeAccount = 'CHANGE_ACCOUNT',
    ChangeEthAddress = 'CHANGE_ETH_ADDRESS',
    ChangeProvider = 'CHANGE_PROVIDER',
    ChangeStorageToken = 'CHANGE_STORAGE_TOKEN',
    ChangeStorageLocation = 'CHANGE_STORAGE_LOCATION',
    SetDefaultServiceUrl = 'SET_DEFAULT_SERVICE_URL',
}

type ConnectionPayload = {
    [ConnectionType.ChangeConnectionState]: ConnectionState;
    [ConnectionType.ChangeSocket]: Socket<DefaultEventsMap, DefaultEventsMap>;
    [ConnectionType.ChangeAccount]: Account;
    [ConnectionType.ChangeEthAddress]: string;
    [ConnectionType.ChangeProvider]: ethers.providers.JsonRpcProvider;
    [ConnectionType.ChangeStorageToken]: string | undefined;
    [ConnectionType.ChangeStorageLocation]: StorageLocation;
    [ConnectionType.SetDefaultServiceUrl]: string;
};

export type ConnectionActions =
    ActionMap<ConnectionPayload>[keyof ActionMap<ConnectionPayload>];

export function connectionReducer(
    state: Connection,
    action: ConnectionActions,
): Connection {
    switch (action.type) {
        case ConnectionType.ChangeConnectionState:
            if (state.connectionState === action.payload) {
                return state;
            } else {
                log(
                    `[Connection] New connection state ${
                        ConnectionState[action.payload]
                    }`,
                );
                return {
                    ...state,
                    connectionState: action.payload,
                };
            }
        case ConnectionType.ChangeSocket:
            log(`[Connection] New socket`);
            return {
                ...state,
                //@ts-ignore
                socket: action.payload,
            };

        case ConnectionType.ChangeAccount:
            log(`[Connection] Set account ${action.payload.ensName}`);
            return {
                ...state,
                account: action.payload,
            };

        case ConnectionType.ChangeEthAddress:
            log(`[Connection] Set eth address to ${action.payload}`);
            return {
                ...state,
                ethAddress: action.payload,
            };

        case ConnectionType.ChangeStorageLocation:
            if (state.storageLocation === action.payload) {
                return state;
            } else {
                log(`[Connection] Set storage location to ${action.payload}`);

                return {
                    ...state,
                    storageLocation: action.payload,
                };
            }
        case ConnectionType.ChangeProvider:
            log(`[Connection] Set provider`);
            return {
                ...state,
                //@ts-ignore
                provider: action.payload,
            };

        case ConnectionType.ChangeStorageToken:
            if (state.storageToken === action.payload) {
                return state;
            } else {
                log(`[Connection] Set sorage token`);
                return {
                    ...state,
                    storageToken: action.payload,
                };
            }

        case ConnectionType.SetDefaultServiceUrl:
            log(`[Connection] set default service url ${action.payload}`);
            return {
                ...state,
                defaultServiceUrl: action.payload,
            };

        default:
            return state;
    }
}
