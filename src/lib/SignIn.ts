import { ethers } from 'ethers';
import { log } from './log';
import {
    ConnectionState,
    EncryptedKeys,
    Keys,
    PrivateKeys,
} from './Web3Provider';

export async function signIn(
    provider: ethers.providers.JsonRpcProvider,
    account: string,
    requestChallenge: (
        account: string,
    ) => Promise<{ challenge: string; hasEncryptionKey: boolean }>,
    personalSign: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
        challenge: string,
    ) => Promise<string>,
    submitSignedChallenge: (
        challenge: string,
        signature: string,
    ) => Promise<void>,
    getKeys: (
        accountAddress: string,
        sessionToken: string,
    ) => Promise<EncryptedKeys | undefined>,
    decrypt: (
        provider: ethers.providers.JsonRpcProvider,
        encryptedData: string,
        account: string,
    ) => Promise<string>,
    submitPublicKeyApi: (
        accountAddress: string,
        encryptedKeys: Keys,
        token: string,
    ) => Promise<void>,
    submitEncryptedKeys: (
        accountAddress: string,
        sessionToken: string,
        keys: Keys,
        submitKeysApi: (
            accountAddress: string,
            encryptedKeys: EncryptedKeys,
            token: string,
        ) => Promise<void>,
    ) => Promise<void>,
    createMessagingKeyPair: () => Partial<Keys>,
    getPublicKey: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
    ) => Promise<string>,
): Promise<{
    connectionState: ConnectionState;
    sessionToken?: string;
    keys?: Keys;
}> {
    try {
        const challengeResponse = await requestChallenge(account);

        log(`Sign in challenge: ${challengeResponse.challenge}`);

        const signature = await personalSign(
            provider,
            account,
            challengeResponse.challenge,
        );
        await submitSignedChallenge(challengeResponse.challenge, signature);
        const sessionToken = getSessionToken(signature);

        let keys: Keys | undefined;

        if (!challengeResponse.hasEncryptionKey) {
            const keyPair = createMessagingKeyPair();

            keys = {
                ...keyPair,
                publicKey: await getPublicKey(provider, account),
            };

            await submitEncryptedKeys(
                account,
                sessionToken,
                keys,
                submitPublicKeyApi,
            );
        } else {
            const encryptedKeys: EncryptedKeys = (await getKeys(
                account,
                sessionToken,
            )) as EncryptedKeys;
            const decryptedPrivateKeys: PrivateKeys = JSON.parse(
                JSON.parse(
                    await decrypt(
                        provider,
                        encryptedKeys.encryptedPrivateKeys,
                        account,
                    ),
                ).data,
            );
            keys = {
                ...decryptedPrivateKeys,
                publicKey: encryptedKeys.publicKey,
                publicMessagingKey: encryptedKeys.publicMessagingKey,
                publicSigningKey: encryptedKeys.publicSigningKey,
            };
        }

        return {
            connectionState: ConnectionState.SignedIn,
            sessionToken,
            keys,
        };
    } catch (e) {
        return {
            connectionState: ConnectionState.SignInFailed,
        };
    }
}

export function getSessionToken(signature: string) {
    return ethers.utils.keccak256(signature);
}
