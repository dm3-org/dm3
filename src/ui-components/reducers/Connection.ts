import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import * as Lib from '../../lib';
import { ActionMap } from './shared';

export enum ConnectionType {
    ChangeConnectionState = 'CHANGE_CONNECTION_STATE',
    ChangeSocket = 'CHANGE_SOCKET',
    ChangeAccount = 'CHANGE_ACCOUNT',
    ChangeProvider = 'CHANGE_PROVIDER',
    ChangeStorageToken = 'CHANGE_STORAGE_TOKEN',
    ChangeStorageLocation = 'CHANGE_STORAGE_LOCATION',
}

type ConnectionPayload = {
    [ConnectionType.ChangeConnectionState]: Lib.ConnectionState;
    [ConnectionType.ChangeSocket]: Socket<DefaultEventsMap, DefaultEventsMap>;
    [ConnectionType.ChangeAccount]: Lib.Account;
    [ConnectionType.ChangeProvider]: ethers.providers.JsonRpcProvider;
    [ConnectionType.ChangeStorageToken]: string | undefined;
    [ConnectionType.ChangeStorageLocation]: Lib.StorageLocation;
};

export type ConnectionActions =
    ActionMap<ConnectionPayload>[keyof ActionMap<ConnectionPayload>];

export function connectionReducer(
    state: Lib.Connection,
    action: ConnectionActions,
): Lib.Connection {
    switch (action.type) {
        case ConnectionType.ChangeConnectionState:
            Lib.log(
                `New connection state ${Lib.ConnectionState[action.payload]}`,
            );
            return {
                ...state,
                connectionState: action.payload,
            };
        case ConnectionType.ChangeSocket:
            Lib.log(`New socket`);
            return {
                ...state,
                socket: action.payload,
            };

        case ConnectionType.ChangeAccount:
            Lib.log(`Set account ${action.payload.address}`);
            return {
                ...state,
                account: action.payload,
            };

        case ConnectionType.ChangeStorageLocation:
            Lib.log(`Set storage location to ${action.payload}`);

            return {
                ...state,
                storageLocation: action.payload,
            };

        case ConnectionType.ChangeProvider:
            Lib.log(`Set provider`);
            return {
                ...state,
                provider: action.payload,
            };

        case ConnectionType.ChangeStorageToken:
            Lib.log(`Set sorage toek`);
            return {
                ...state,
                storageToken: action.payload,
            };

        default:
            return state;
    }
}
