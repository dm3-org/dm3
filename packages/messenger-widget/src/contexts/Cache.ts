import { log } from 'dm3-lib-shared';
import { CacheActions, CacheType } from '../utils/enum-type-utils';
import { formatAddress } from 'dm3-lib-profile';
import { Cache } from '../interfaces/context';

export function cacheReducer(state: Cache, action: CacheActions): Cache {
    switch (action.type) {
        case CacheType.AddAbis:
            const abis = new Map<string, string>(state.abis);

            action.payload.forEach((abiContainer) => {
                const address = formatAddress(abiContainer.address);
                if (state.abis.has(address)) {
                    log(`[Cache] ABI for ${address} already in cache`, 'info');
                } else {
                    log(`[Cache] Adding ABI for ${address}`, 'info');
                    abis.set(address, abiContainer.abi);
                }
            });

            return {
                ...state,
                abis,
            };

        case CacheType.Contacts:
            return {
                ...state,
                contacts: action.payload,
            };

        case CacheType.LastConversation:
            return {
                ...state,
                lastConversation: action.payload,
            };

        case CacheType.MessageSizeLimit:
            return {
                ...state,
                messageSizeLimit: action.payload,
            };

        default:
            return state;
    }
}
