import { KeyPair } from 'dm3-lib-crypto';
import { sha256, stringify } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import queryString from 'query-string';
import { Dm3Profile } from './profileResolver/ProfileResolver';

export function formatAddress(address: string) {
    return ethers.utils.getAddress(address);
}

export interface UserProfile {
    publicEncryptionKey: string;
    publicSigningKey: string;
    deliveryServices: string[];
}

export interface ProfileKeys {
    encryptionKeyPair: KeyPair;
    signingKeyPair: KeyPair;
    storageEncryptionKey: string;
    storageEncryptionNonce: number;
}

export interface SignedUserProfile {
    profile: UserProfile;
    signature: string;
}

export interface PrivateKeys {
    privateMessagingKey: string;
    privateSigningKey: string;
}

export interface Account {
    ensName: string;
    profile?: UserProfile;
    profileSignature?: string;
}

export const PROFILE_RECORD_NAME = 'network.dm3.profile';

/**
 * signs a profile with an ethereum account key
 * @param stringifiedProfile stringified dm3 user profile object
 */
export function getProfileCreationMessage(stringifiedProfile: string) {
    return `Hearby your dm3 profile is linked with your Ethereum account\n\n ${stringifiedProfile}`;
}

/**
 * normalizes an ENS name
 * @param ensName name that should be normalized
 */
export function normalizeEnsName(ensName: string): string {
    return ethers.utils.nameprep(ensName);
}

/**
 * make too long names shorter
 * @param ensName The ENS name
 * @param forFile Use shortend name for a file name
 */
export function getAccountDisplayName(
    ensName: string,
    forFile?: boolean,
): string {
    const normalizedEnsName = normalizeEnsName(ensName);

    return normalizedEnsName.length > 10
        ? normalizedEnsName.substring(0, 6) +
              (forFile ? '-' : '...') +
              normalizedEnsName.substring(normalizedEnsName.length - 4)
        : normalizedEnsName;
}

/**
 * check the signature of the fetched user profile
 * @param provider Eth rpc provider
 * @param signedUserProfile The profile to check
 * @param ensName The ENS domain name
 */
export async function checkUserProfile(
    provider: ethers.providers.JsonRpcProvider,
    { profile, signature }: SignedUserProfile,
    ensName: string,
): Promise<boolean> {
    const accountAddress = await provider.resolveName(ensName);

    if (!accountAddress) {
        throw Error(`Couldn't resolve name`);
    }

    return checkUserProfileWithAddress({ profile, signature }, accountAddress);
}

/**
 * check the signature of the fetched user profile using the eth address
 * @param signedUserProfile The profile to check
 * @param accountAddress The ENS domain name
 */
export function checkUserProfileWithAddress(
    { profile, signature }: SignedUserProfile,
    accountAddress: string,
): boolean {
    const createUserProfileMessage = getProfileCreationMessage(
        stringify(profile),
    );

    return (
        ethers.utils.recoverAddress(
            ethers.utils.hashMessage(createUserProfileMessage),
            signature,
        ) === formatAddress(accountAddress)
    );
}

/**
 * check a signature by recovering the signer address
 * @param stringToCheck Signed string
 * @param signature The signature
 * @param signature The Ethereum account address of the signer
 */
export function checkStringSignature(
    stringToCheck: string,
    signature: string,
    accountAddress: string,
): boolean {
    return (
        ethers.utils.recoverAddress(
            ethers.utils.hashMessage(stringToCheck),
            signature,
        ) === formatAddress(accountAddress)
    );
}

/**
 * create the string used to create the browser storage key
 * @param ensName The ENS name
 */
export function getBrowserStorageKey(ensName: string) {
    return 'userStorageSnapshot:' + normalizeEnsName(ensName);
}

export type GetResource<T> = (uri: string) => Promise<T | undefined>;

/**
 * checks the user profile hash contained in the `dm3Hash` URI prarameter
 * @param profile dm3 user profile
 * @param uri URI containing the `dm3Hash` prarameter
 */
export function checkProfileHash(profile: Dm3Profile, uri: string): boolean {
    const parsedUri = queryString.parseUrl(uri);
    return sha256(stringify(profile)) === parsedUri.query.dm3Hash;
}
