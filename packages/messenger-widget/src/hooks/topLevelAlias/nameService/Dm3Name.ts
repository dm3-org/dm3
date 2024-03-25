import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { ITLDResolver } from './TLDResolver';
import { getNameForAddress } from '../../../adapters/offchainResolverApi';
import { ethers } from 'ethers';

function getIdForAddress(address: string) {
    return address + globalConfig.ADDR_ENS_SUBDOMAIN();
}

export class Dm3Name implements ITLDResolver {
    private readonly provider: ethers.providers.JsonRpcProvider;

    constructor(provider: ethers.providers.JsonRpcProvider) {
        this.provider = provider;
    }
    async isResolverForTldName(ensName: string): Promise<boolean> {
        const isUserSubDomain = ensName.endsWith(
            globalConfig.USER_ENS_SUBDOMAIN(),
        );
        const hasDm3Profile = await this.hasDm3NameProfile(ensName);

        return isUserSubDomain && hasDm3Profile;
    }
    async isResolverForAliasName(ensName: string): Promise<boolean> {
        return ensName.endsWith(globalConfig.ADDR_ENS_SUBDOMAIN());
    }
    async resolveTLDtoAlias(ensName: string): Promise<string> {
        //Offchain resolver should retrive the profile
        const address = await this.provider.resolveName(ensName);
        if (!address) {
            throw new Error('No address found for ' + ensName);
        }
        return getIdForAddress(ethers.utils.getAddress(address));
    }

    private async hasDm3NameProfile(ensName: string): Promise<boolean> {
        try {
            const ensNameHasAddress = await this.provider.resolveName(ensName);
            return !!ensNameHasAddress;
        } catch (err) {
            console.log(
                `Cant resolve Dm3name for ${ensName} to address error: ${err}`,
            );
            return false;
        }
    }

    //e.g. 0x1234.user.dm3.eth -> myname.user.dm3.eth
    async resolveAliasToTLD(
        ensName: string,
        resolverBackendUrl: string,
    ): Promise<string> {
        //For whatever reason the API accepts the address without the subdomain
        const addr = ensName.split('.')[0];
        const OFFCHAIN_RESOLVER_ADDRESS = resolverBackendUrl!;

        const dm3Name = await getNameForAddress(
            addr,
            OFFCHAIN_RESOLVER_ADDRESS,
        );
        return dm3Name ?? ensName;
    }
}
