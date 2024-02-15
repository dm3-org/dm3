import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { ITLDResolver } from './TLDResolver';
import { getNameForAddress } from '../../../adapters/offchainResolverApi';
import { getAliasChain } from '@dm3-org/dm3-lib-delivery-api';

const OFFCHAIN_RESOLVER_ADDRESS = process.env.REACT_APP_RESOLVER_BACKEND!;

export class Dm3Name implements ITLDResolver {
    async isResolverForTldName(ensName: string): Promise<boolean> {
        return ensName.endsWith(globalConfig.USER_ENS_SUBDOMAIN());
    }
    async isResolverForAliasName(ensName: string): Promise<boolean> {
        return ensName.endsWith(globalConfig.ADDR_ENS_SUBDOMAIN());
    }

    //e.g. 0x1234.user.dm3.eth -> myname.user.dm3.eth
    async resolveAliasToTLD(ensName: string): Promise<string> {
        //For whatever reason the API accepts the address without the subdomain
        const addr = ensName.split('.')[0];

        const dm3Name = await getNameForAddress(
            addr,
            OFFCHAIN_RESOLVER_ADDRESS,
        );
        return dm3Name ?? ensName;
    }

    //e.g. myname.user.dm3.eth -> 0x1234.user.dm3.eth
    async resolveTLDtoAlias(ensName: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
}
