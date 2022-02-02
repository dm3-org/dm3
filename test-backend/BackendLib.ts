export interface Session {
    account: string;
    challenge?: string;
    token?: string;
    ttl?: undefined;
}

export function checkToken(
    sessions: Map<string, Session>,
    accountAddress: string,
    token: string,
): boolean {
    const session = sessions.get(accountAddress);
    const passed = session && session?.token === token;
    console.log(
        `Token check for ${accountAddress}: ${passed ? 'PASSED' : 'FAILED'}`,
    );
    return passed ? true : false;
}
