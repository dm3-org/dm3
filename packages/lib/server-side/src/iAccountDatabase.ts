export interface IAccountDatabase {
    hasAccount: (ensName: string) => Promise<boolean>;
}
