import * as Lib from '../../lib';
import { ActionMap, GlobalState } from './shared';

export interface Cache {
    ensNames: Map<string, string>;
    abis: Map<string, string>;
    avatarUrls: Map<string, string>;
}

export enum CacheType {
    AddEnsName = 'ADD_ENS_NAME',
    AddAbis = 'ADD_ABIS',
    AddAvatarUrl = 'ADD_AVATAR_URL',
}

export type CachePayload = {
    [CacheType.AddEnsName]: { address: string; name: string };
    [CacheType.AddAbis]: { address: string; abi: string }[];
    [CacheType.AddAvatarUrl]: { address: string; url: string };
};

export type CacheActions =
    ActionMap<CachePayload>[keyof ActionMap<CachePayload>];

export function cacheReducer(state: Cache, action: CacheActions): Cache {
    switch (action.type) {
        case CacheType.AddEnsName:
            Lib.log(
                `New ens name ${action.payload.name} for ${action.payload.address}`,
            );
            const ensNames = new Map<string, string>(state.ensNames);
            ensNames.set(action.payload.address, action.payload.name);
            return {
                ...state,
                ensNames,
            };

        case CacheType.AddAvatarUrl:
            Lib.log(
                `Add avatar url ${action.payload.url} for ${action.payload.address}`,
            );

            const avatarUrls = new Map<string, string>(state.avatarUrls);
            avatarUrls.set(action.payload.address, action.payload.url);
            return {
                ...state,
                avatarUrls,
            };

        case CacheType.AddAbis:
            Lib.log(`Add ABIs`);

            const abis = new Map<string, string>(state.abis);

            action.payload.forEach((abiContainer) => {
                const address = Lib.formatAddress(abiContainer.address);
                if (state.abis.has(address)) {
                    Lib.log(`- ABI for ${address} already in cache`);
                } else {
                    Lib.log(`- Adding ABI for ${address}`);
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
