export abstract class TLDResolver {
    private readonly topLevelDomain: string;
    private readonly topLevelAlias: string;

    constructor(topLevelDomain: string, topLevelAlias: string) {
        this.topLevelDomain = topLevelDomain;
        this.topLevelAlias = topLevelAlias;
    }

    isResolverForTldName(ensName: string): Promise<boolean> {
        return Promise.resolve(ensName.endsWith(this.topLevelDomain));
    }
    isResolverForAliasName(ensName: string): Promise<boolean> {
        return Promise.resolve(ensName.endsWith(this.topLevelAlias));
    }
    //The alias format is used to display in the UI
    //e.g. 0x1234.gnosis.eth -> 0x1234.gno
    resolveAliasToTLD(ensName: string): Promise<string> {
        return Promise.resolve(
            ensName.replace(this.topLevelAlias, this.topLevelDomain),
        );
    }
    //The alias format is used to store the contact in the DB
    //e.g. 0x1234.gno -> 0x1234.gnosis.eth
    resolveTLDtoAlias(ensName: string): Promise<string> {
        return Promise.resolve(
            ensName.replace(this.topLevelDomain, this.topLevelAlias),
        );
    }
}
