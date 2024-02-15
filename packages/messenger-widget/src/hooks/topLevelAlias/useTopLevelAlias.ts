import { useCallback, useState } from 'react';
import { EthAddressResolver } from './nameService/EthAddress';
import { Genome } from './nameService/Genome';
import { ITLDResolver } from './nameService/TLDResolver';
import { Dm3Name } from './nameService/Dm3Name';

const SUPPORTED_NAMESERVICES: ITLDResolver[] = [
    new Genome(),
    new Dm3Name(),
    new EthAddressResolver(),
];

export type TldAliasCache = {
    [ensName: string]: string;
};

export const useTopLevelAlias = () => {
    const [tldAliasCache, setTldAliasCache] = useState<TldAliasCache>({});

    const resolveAliasToTLD = async (ensName: string) => {
        if (tldAliasCache[ensName]) {
            return tldAliasCache[ensName];
        }
        for (const nameservice of SUPPORTED_NAMESERVICES) {
            if (await nameservice.isResolverForAliasName(ensName)) {
                const tldName = await nameservice.resolveAliasToTLD(ensName);
                setTldAliasCache((prev) => ({ ...prev, [ensName]: tldName }));
                return tldName;
            }
        }
        return ensName;
    };
    //The alias format is used to store the contact in the DB
    //e.g. 0x1234.gno -> 0x1234.gnosis.eth
    const resolveTLDtoAlias = async (ensName: string) => {
        if (tldAliasCache[ensName]) {
            return tldAliasCache[ensName];
        }
        for (const nameservice of SUPPORTED_NAMESERVICES) {
            if (await nameservice.isResolverForTldName(ensName)) {
                const aliasName = await nameservice.resolveTLDtoAlias(ensName);
                setTldAliasCache((prev) => ({ ...prev, [ensName]: aliasName }));
                return aliasName;
            }
        }
        return ensName;
    };

    return {
        resolveAliasToTLD,
        resolveTLDtoAlias,
    };
};
