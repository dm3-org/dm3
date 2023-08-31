import { log } from 'dm3-lib-shared';
import { CacheActions, CacheType } from '../utils/enum-type-utils';
import { formatAddress } from 'dm3-lib-profile';
import { Cache } from '../interfaces/context';

export function cacheReducer(state: Cache, action: CacheActions): Cache {
    switch (action.type) {
        case CacheType.AddAvatarUrl:
            if (state.avatarUrls.has(action.payload.ensName)) {
                return state;
            }

            log(
                `[Cache] Add avatar url ${action.payload.url} for ${action.payload.ensName}`,
                'info',
            );

            const avatarUrls = new Map<string, string>(state.avatarUrls);
            avatarUrls.set(action.payload.ensName, action.payload.url);
            return {
                ...state,
                avatarUrls,
            };

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

        default:
            return state;
    }
}
