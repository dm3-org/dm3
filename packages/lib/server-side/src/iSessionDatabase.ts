import { Session as DSSession, spamFilter } from '@dm3-org/dm3-lib-delivery';

export interface ISessionDatabase {
    setSession: (ensName: string, session: DSSession) => Promise<void>;

    getSession: (ensName: string) => Promise<
        | (DSSession & {
              spamFilterRules: spamFilter.SpamFilterRules;
          })
        | null
    >;
}
