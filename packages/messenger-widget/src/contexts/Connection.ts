import { log } from 'dm3-lib-shared';
import { Connection } from '../interfaces/web3';
import {
    ConnectionActions,
    ConnectionState,
    ConnectionType,
} from '../utils/enum-type-utils';

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
                    'info',
                );
                return {
                    ...state,
                    connectionState: action.payload,
                };
            }
        case ConnectionType.ChangeSocket:
            log(`[Connection] New socket`, 'info');
            return {
                ...state,
                //@ts-ignore
                socket: action.payload,
            };

        case ConnectionType.ChangeAccount:
            log(`[Connection] Set account ${action.payload.ensName}`, 'info');
            return {
                ...state,
                account: action.payload,
            };

        case ConnectionType.ChangeEthAddress:
            log(`[Connection] Set eth address to ${action.payload}`, 'info');
            return {
                ...state,
                ethAddress: action.payload,
            };

        case ConnectionType.ChangeStorageLocation:
            if (state.storageLocation === action.payload) {
                return state;
            } else {
                log(
                    `[Connection] Set storage location to ${action.payload}`,
                    'info',
                );

                return {
                    ...state,
                    storageLocation: action.payload,
                };
            }
        case ConnectionType.ChangeProvider:
            log(`[Connection] Set provider`, 'info');
            return {
                ...state,
                //@ts-ignore
                provider: action.payload,
            };

        case ConnectionType.ChangeStorageToken:
            if (state.storageToken === action.payload) {
                return state;
            } else {
                log(`[Connection] Set sorage token`, 'info');
                return {
                    ...state,
                    storageToken: action.payload,
                };
            }

        case ConnectionType.SetDefaultServiceUrl:
            log(
                `[Connection] set default service url ${action.payload}`,
                'info',
            );
            return {
                ...state,
                defaultServiceUrl: action.payload,
            };

        default:
            return state;
    }
}
