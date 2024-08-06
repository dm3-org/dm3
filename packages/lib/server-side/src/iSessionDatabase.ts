import { Session as DSSession, spamFilter } from '@dm3-org/dm3-lib-delivery';

export interface IAccountDatabase {
    hasAccount: (ensName: string) => Promise<boolean>;
}
