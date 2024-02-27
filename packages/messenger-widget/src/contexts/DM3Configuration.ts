import { log } from '@dm3-org/dm3-lib-shared';
import {
    DM3ConfigurationStateActions,
    DM3ConfigurationStateType,
} from '../utils/enum-type-utils';
import { DM3Configuration } from '../interfaces/config';

export function dm3ConfigurationReducer(
    state: DM3Configuration,
    action: DM3ConfigurationStateActions,
): DM3Configuration {
    switch (action.type) {
        case DM3ConfigurationStateType.DM3Configuration:
            log(`[DM3 configuration] set `, 'info');
            return {
                ...state,
                defaultContact: action.payload.defaultContact,
                defaultServiceUrl: action.payload.defaultServiceUrl,
                ethereumProvider: action.payload.ethereumProvider,
                walletConnectProjectId: action.payload.walletConnectProjectId,
                userEnsSubdomain: action.payload.userEnsSubdomain,
                addressEnsSubdomain: action.payload.addressEnsSubdomain,
                resolverBackendUrl: action.payload.resolverBackendUrl,
                profileBaseUrl: action.payload.profileBaseUrl,
                defaultDeliveryService: action.payload.defaultDeliveryService,
                backendUrl: action.payload.backendUrl,
                chainId: action.payload.chainId,
                resolverAddress: action.payload.resolverAddress,
                showAlways: action.payload.showAlways,
                showContacts: action.payload.showContacts,
                hideFunction: action.payload.hideFunction,
                theme: action.payload.theme,
                signInImage: action.payload.signInImage,
            };

        default:
            return state;
    }
}
