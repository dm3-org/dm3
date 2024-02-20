import { log } from '@dm3-org/dm3-lib-shared';
import { Connection } from '../interfaces/web3';
import { ConnectionActions, ConnectionType } from '../utils/enum-type-utils';

export function connectionReducer(
    state: Connection,
    action: ConnectionActions,
): Connection {
    switch (action.type) {
        case ConnectionType.ChangeSocket:
            log(`[Connection] New socket`, 'info');
            return {
                ...state,
                //@ts-ignore
                socket: action.payload,
            };

        case ConnectionType.ChangeProvider:
            log(`[Connection] Set provider`, 'info');
            return {
                ...state,
                //@ts-ignore
                provider: action.payload,
            };

        case ConnectionType.SetDefaultServiceUrl:
            log(
                `[Connection] set default service url ${action.payload}`,
                'info',
            );
            return {
                ...state,
                defaultServiceUrl: action.payload,
            };

        case ConnectionType.Reset:
            log(`[Connection] reset`, 'info');
            return {
                defaultServiceUrl: process.env.REACT_APP_BACKEND as string,
            };

        default:
            return state;
    }
}
