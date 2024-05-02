import { ethers } from 'ethers';
import { useContext, useState } from 'react';
import { Dm3Name } from './nameService/Dm3Name';
import { EthAddressResolver } from './nameService/EthAddress';
import { EthereumNameService } from './nameService/EthereumNameService';
import { Genome } from './nameService/Genome';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { OptimismNames } from './nameService/OptimismNames';

const SUPPORTED_NAMESERVICES = (
    provider: ethers.providers.JsonRpcProvider,
    addrEnsSubdomain: string,
    userEnsSubdomain: string,
) => [
    new EthereumNameService(provider, addrEnsSubdomain, userEnsSubdomain),
    new Genome(provider, addrEnsSubdomain),
    new OptimismNames(provider, addrEnsSubdomain),
    new Dm3Name(provider, addrEnsSubdomain, userEnsSubdomain),
    new EthAddressResolver(),
];

export type TldAliasCache = {
    [ensName: string]: string;
};

export const useTopLevelAlias = () => {
    const mainnetProvider = useMainnetProvider();
    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const [tldAliasCache, setTldAliasCache] = useState<TldAliasCache>({});
    const [aliasTldCache, setAliasTldCache] = useState<TldAliasCache>({});

    //e.g. 0x1234.gnosis.eth -> 0x1234.gno
    const resolveAliasToTLD = async (ensName: string) => {
        if (aliasTldCache[ensName]) {
            return aliasTldCache[ensName];
        }
        for (const nameservice of SUPPORTED_NAMESERVICES(
            mainnetProvider,
            dm3Configuration.addressEnsSubdomain,
            dm3Configuration.userEnsSubdomain,
        )) {
            if (
                await nameservice.isResolverForAliasName(
                    ensName,
                    dm3Configuration.addressEnsSubdomain,
                )
            ) {
                const tldName = await nameservice.resolveAliasToTLD(
                    ensName,
                    dm3Configuration.resolverBackendUrl,
                );
                setAliasTldCache((prev) => ({ ...prev, [ensName]: tldName }));
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
        for (const nameservice of SUPPORTED_NAMESERVICES(
            mainnetProvider,
            dm3Configuration.addressEnsSubdomain,
            dm3Configuration.userEnsSubdomain,
        )) {
            if (await nameservice.isResolverForTldName(ensName)) {
                const aliasName = await nameservice.resolveTLDtoAlias(
                    ensName,
                    dm3Configuration.addressEnsSubdomain,
                );
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
