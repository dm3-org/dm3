import { ethers } from 'ethers';
import { useContext, useState } from 'react';
import { Dm3Name } from './nameService/Dm3Name';
import { EthAddressResolver } from './nameService/EthAddress';
import { EthereumNameService } from './nameService/EthereumNameService';
import { Genome } from './nameService/Genome';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { useDm3Configuration } from '../configuration/useDM3Configuration';

const SUPPORTED_NAMESERVICES = (provider: ethers.providers.JsonRpcProvider) => [
    new EthereumNameService(provider),
    new Genome(),
    new Dm3Name(provider),
    new EthAddressResolver(),
];

export type TldAliasCache = {
    [ensName: string]: string;
};

export const useTopLevelAlias = () => {
    const mainnetProvider = useMainnetProvider();
    const { dm3Configuration } = useDm3Configuration();
    const [tldAliasCache, setTldAliasCache] = useState<TldAliasCache>({});

    //e.g. 0x1234.gnosis.eth -> 0x1234.gno
    const resolveAliasToTLD = async (ensName: string) => {
        if (tldAliasCache[ensName]) {
            return tldAliasCache[ensName];
        }
        for (const nameservice of SUPPORTED_NAMESERVICES(mainnetProvider)) {
            if (await nameservice.isResolverForAliasName(ensName)) {
                const tldName = await nameservice.resolveAliasToTLD(
                    ensName,
                    dm3Configuration.resolverBackendUrl,
                );
                setTldAliasCache((prev) => ({ ...prev, [ensName]: tldName }));
                return tldName;
            }
        }
        return ensName;
    };
    //e.g. 0x1234.gno -> 0x1234.gnosis.eth
    const resolveTLDtoAlias = async (ensName: string) => {
        if (tldAliasCache[ensName]) {
            return tldAliasCache[ensName];
        }
        for (const nameservice of SUPPORTED_NAMESERVICES(mainnetProvider)) {
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
