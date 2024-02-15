import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { getNameForAddress } from '../../adapters/offchainResolverApi';

const OFFCHAIN_RESOLVER_ADDRESS = process.env.REACT_APP_RESOLVER_BACKEND!;

function getIdForAddress(address: string) {
    return address + globalConfig.ADDR_ENS_SUBDOMAIN();
}

export const useAlias = () => {
    const aliasCache = new Map<string, string>();

    const getDm3Name = async (ensNameOrAddress: string) => {
        const isIdEnsName = ensNameOrAddress.endsWith(
            globalConfig.ADDR_ENS_SUBDOMAIN(),
        );
        const id = isIdEnsName
            ? ensNameOrAddress
            : getIdForAddress(ensNameOrAddress);

        //For whatever reason the API accepts the address without the subdomain
        const addr = id.split('.')[0];

        const dm3Name = await getNameForAddress(
            addr,
            OFFCHAIN_RESOLVER_ADDRESS,
        );
        if (!dm3Name) {
            return id;
        }
        return dm3Name;
    };

    const getAlias = async (ensName: string) => {
        if (aliasCache.has(ensName)) {
            return aliasCache.get(ensName) as string;
        }
        const aliasName = await getDm3Name(ensName);
        aliasCache.set(ensName, aliasName);
        return aliasName;
    };
    const setAlias = (address: string, alias: string) => {
        return Promise.resolve();
    };
    return {
        getAlias,
        setAlias,
    };
};
