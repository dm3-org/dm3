export function readKeyFromEnv(keyName: string) {
    const key = process.env[keyName];
    if (!key) {
        throw Error(`Missing ${keyName} in env`);
    }

    return key;
}
