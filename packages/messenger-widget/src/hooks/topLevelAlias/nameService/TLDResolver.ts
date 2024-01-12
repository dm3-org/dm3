export abstract class TLDResolver {
    private readonly topLevelDomain: string;
    private readonly topLevelAlias: string;

    constructor(topLevelDomain: string, topLevelAlias: string) {
        this.topLevelDomain = topLevelDomain;
        this.topLevelAlias = topLevelAlias;
    }

    isResolverForTldName(ensName: string): boolean {
        return ensName.endsWith(this.topLevelDomain);
    }
    isResolverForAliasName(ensName: string): boolean {
        return ensName.endsWith(this.topLevelAlias);
    }
    //The alias format is used to display in the UI
    //e.g. 0x1234.gnosis.eth -> 0x1234.gno
    resolveAliasToTLD(ensName: string): string {
        return ensName.replace(this.topLevelAlias, this.topLevelDomain);
    }
    //The alias format is used to store the contact in the DB
    //e.g. 0x1234.gno -> 0x1234.gnosis.eth
    resolveTLDtoAlias(ensName: string): string {
        return ensName.replace(this.topLevelDomain, this.topLevelAlias);
    }
}
