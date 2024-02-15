export interface ITLDResolver {
    isResolverForTldName(ensName: string): Promise<boolean>;
    isResolverForAliasName(ensName: string): Promise<boolean>;
    resolveAliasToTLD(ensName: string): Promise<string>;
    resolveTLDtoAlias(ensName: string): Promise<string>;
}
export abstract class TLDResolver implements ITLDResolver {
    private readonly topLevelDomain: string;
    private readonly topLevelAlias: string;

    constructor(topLevelDomain: string, topLevelAlias: string) {
        this.topLevelDomain = topLevelDomain;
        this.topLevelAlias = topLevelAlias;
    }

    async isResolverForTldName(ensName: string): Promise<boolean> {
        return ensName.endsWith(this.topLevelDomain);
    }
    async isResolverForAliasName(ensName: string): Promise<boolean> {
        return ensName.endsWith(this.topLevelAlias);
    }
    //The alias format is used to display in the UI
    //e.g. 0x1234.gnosis.eth -> 0x1234.gno
    async resolveAliasToTLD(ensName: string): Promise<string> {
        return ensName.replace(this.topLevelAlias, this.topLevelDomain);
    }
    //The alias format is used to store the contact in the DB
    //e.g. 0x1234.gno -> 0x1234.gnosis.eth
    async resolveTLDtoAlias(ensName: string): Promise<string> {
        return ensName.replace(this.topLevelDomain, this.topLevelAlias);
    }
}
