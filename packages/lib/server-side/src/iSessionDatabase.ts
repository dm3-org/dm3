import { Session as DSSession, spamFilter } from '@dm3-org/dm3-lib-delivery';

export interface IAccountDatabase {
    setAccount: (ensName: string, session: DSSession) => Promise<void>;

    getAccount: (ensName: string) => Promise<
        | (DSSession & {
              spamFilterRules: spamFilter.SpamFilterRules;
          })
        | null
    >;
}
