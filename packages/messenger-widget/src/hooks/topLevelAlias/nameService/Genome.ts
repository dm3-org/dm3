import { ethers } from 'ethers';
import { ITLDResolver, TLDResolver } from './TLDResolver';
import { createWeb3Name } from '@web3-name-sdk/core';
import { globalConfig } from '@dm3-org/dm3-lib-shared';

const TOP_LEVEL_DOMAIN = '.gno';
//Change to .gnosis as soon as they changed the resolver in their governance
const TOP_LEVEL_ALIAS = '.alex1234.eth';

function getIdForAddress(address: string) {
    return address + globalConfig.ADDR_ENS_SUBDOMAIN();
}

export class Genome implements ITLDResolver {
    private readonly provider: ethers.providers.JsonRpcProvider;

    constructor(provider: ethers.providers.JsonRpcProvider) {
        this.provider = provider;
    }
    //e.g. max.gno => 0x1234.addr.dm3.eth
    async isResolverForTldName(ensName: string): Promise<boolean> {
        const isGnoDomain = ensName.endsWith(TOP_LEVEL_DOMAIN);

        if (!isGnoDomain) {
            return false;
        }

        return this.hasDm3ProfileOnEnsProfile(ensName);
    }
    //e.g. max.gno => 0x1234.addr.dm3.eth
    async resolveTLDtoAlias(ensName: string): Promise<string> {
        const aliasName = ensName.replace(TOP_LEVEL_DOMAIN, TOP_LEVEL_ALIAS);
        const address = await this.provider.resolveName(aliasName);
        if (!address) {
            throw new Error('No address found for ' + ensName);
        }
        return getIdForAddress(ethers.utils.getAddress(address));
    }
    //e.g. 0x1234.addr.dm3.eth => max.gno
    async isResolverForAliasName(ensName: string): Promise<boolean> {
        const address = ensName.split('.')[0];
        if (!ethers.utils.isAddress(address)) {
            return false;
        }
        const web3Name = createWeb3Name();
        const spaceIdWeb3Name = await web3Name.getDomainName({
            address,
            queryChainIdList: [100],
        });
        if (!spaceIdWeb3Name) {
            return false;
        }
        return this.hasDm3ProfileOnEnsProfile(spaceIdWeb3Name);
    }
    //e.g. 0x1234.addr.dm3.eth => max.gno
    async resolveAliasToTLD(ensName: string): Promise<string> {
        const address = ensName.split('.')[0];
        const web3Name = createWeb3Name();

        const spaceIdWeb3Name = await web3Name.getDomainName({
            address,
            queryChainIdList: [100],
        });
        console.log('spaceIdWeb3Name alias hook', spaceIdWeb3Name);
        return spaceIdWeb3Name ?? ensName;
    }

    private async hasDm3ProfileOnEnsProfile(
        spaceIdName: string,
    ): Promise<boolean> {
        try {
            const aliasName = spaceIdName.replace('.gno', TOP_LEVEL_ALIAS);
            const ensNameHasAddress = await this.provider.resolveName(
                aliasName,
            );
            const resolver = await this.provider.getResolver(aliasName);
            if (!resolver) {
                return false;
            }
            const dm3Profile = await resolver.getText('network.dm3.profile');

            if (!dm3Profile) {
                return false;
            }

            return !!ensNameHasAddress;
        } catch (err) {
            console.log(
                `Cant resolve Genome name ${spaceIdName} to address error: ${err}`,
            );
            return false;
        }
    }
}
