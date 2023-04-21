import { log } from 'dm3-lib-shared';
import { ActionMap } from './shared';
import { formatAddress } from 'dm3-lib-profile';

export interface Cache {
    abis: Map<string, string>;
    avatarUrls: Map<string, string>;
}

export enum CacheType {
    AddEnsName = 'ADD_ENS_NAME',
    AddAbis = 'ADD_ABIS',
    AddAvatarUrl = 'ADD_AVATAR_URL',
}

export type CachePayload = {
    [CacheType.AddAbis]: { address: string; abi: string }[];
    [CacheType.AddAvatarUrl]: { ensName: string; url: string };
};

export type CacheActions =
    ActionMap<CachePayload>[keyof ActionMap<CachePayload>];

export function cacheReducer(state: Cache, action: CacheActions): Cache {
    switch (action.type) {
        case CacheType.AddAvatarUrl:
            if (state.avatarUrls.has(action.payload.ensName)) {
                return state;
            }

            log(
                `[Cache] Add avatar url ${action.payload.url} for ${action.payload.ensName}`,
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
                    log(`[Cache] ABI for ${address} already in cache`);
                } else {
                    log(`[Cache] Adding ABI for ${address}`);
                    abis.set(address, abiContainer.abi);
                }
            });

            return {
                ...state,
                abis,
            };

        default:
            return state;
    }
}
