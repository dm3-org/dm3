import { Genome } from './nameService/Genome';
import { TLDResolver } from './nameService/TLDResolver';

const SUPPORTED_NAMESERVICES: TLDResolver[] = [new Genome()];

export const useTopLevelAlias = () => {
    const resolveAliasToTLD = (ensName: string) => {
        for (const nameservice of SUPPORTED_NAMESERVICES) {
            if (nameservice.isResolverForAliasName(ensName)) {
                return nameservice.resolveAliasToTLD(ensName);
            }
        }
        return ensName;
    };
    //The alias format is used to store the contact in the DB
    //e.g. 0x1234.gno -> 0x1234.gnosis.eth
    const resolveTLDtoAlias = (ensName: string) => {
        for (const nameservice of SUPPORTED_NAMESERVICES) {
            if (nameservice.isResolverForTldName(ensName)) {
                return nameservice.resolveTLDtoAlias(ensName);
            }
        }
        return ensName;
    };

    return {
        resolveAliasToTLD,
        resolveTLDtoAlias,
    };
};
