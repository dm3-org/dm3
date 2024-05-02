import { ethers } from 'ethers';

export class EthAddressResolver {
    async isResolverForTldName(ensName: string): Promise<boolean> {
        return ethers.utils.isAddress(ensName);
    }
    async isResolverForAliasName(
        ensName: string,
        addrEnsSubdomain: string,
    ): Promise<boolean> {
        return ensName.endsWith(addrEnsSubdomain);
    }
    //The alias format is used to display in the UI
    //e.g. 0x1234.user.dm3.eth -> 0x1234
    async resolveAliasToTLD(ensName: string): Promise<string> {
        return ensName.split('.')[0];
    }
    //The alias format is used to store the contact in the DB
    //e.g. 0x1234 -> 0x1234.user.dm3.eth
    async resolveTLDtoAlias(
        address: string,
        addrEnsSubdomain: string,
    ): Promise<string> {
        return address + addrEnsSubdomain;
    }
}
