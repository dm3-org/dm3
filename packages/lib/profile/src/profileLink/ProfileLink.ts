// A profile links a scoped profile with the main profile or an ethereum address

import { checkSignature } from 'dm3-lib-crypto';
import { ethers } from 'ethers';

export interface ProfileLink {
    type: 'ProfileLink' | 'EthAddressLink';

    // ENS name of main profile or ethereum address
    mainId: string;

    // ENS name of the scoped profile
    linkedProfile: string;

    // scope identifier, the scoped profile is used for
    scopeUri: string;

    // timestamp in seconds
    issuedAt: number;

    // timestamp in seconds
    expirationTime: number | null;

    nonce: number;
}

export interface SignedProfileLink {
    profileLink: ProfileLink;
    signature: string;
}

/**
 * creates a ProfileLink object
 * @param mainId ENS name of main profile or ethereum address
 * @param linkedProfile ENS name of the scoped profile
 * @param scopeUri scope identifier, the scoped profile is used for
 * @param options optional properties
 */
export function createProfileLink(
    mainId: string,
    linkedProfile: string,
    scopeUri: string,
    options?: { nonce?: number; ttl?: number },
): ProfileLink {
    const issuedAt = Math.floor(Date.now() / 1000);
    return {
        type: ethers.utils.isAddress(mainId) ? 'EthAddressLink' : 'ProfileLink',
        mainId,
        linkedProfile,
        scopeUri,
        issuedAt,
        expirationTime: options?.ttl ? issuedAt + options.ttl : null,
        nonce: options?.nonce ?? 0,
    };
}

function createProfileLinkMessage(profileLink: ProfileLink) {
    return (
        `dm3 Profile Link:\n` +
        `${
            profileLink.scopeUri
        } wants you to link your local dm3 profile with your ${
            profileLink.type === 'ProfileLink'
                ? 'main dm3 profile'
                : 'Ethereum address'
        }.\n\n` +
        `Main ID: ${profileLink.mainId}\n` +
        `Main ID Type: ${profileLink.type}\n` +
        `Linked Profile Name: ${profileLink.linkedProfile}\n` +
        `Nonce: ${profileLink.nonce}\n` +
        `Issued At: ${profileLink.issuedAt}\n` +
        `Expiration Time: ${profileLink.expirationTime}`
    );
}

/**
 * signs a ProfileLink
 * @param profileLink the ProfileLink object to sign
 * @param signer the signer function
 */
export async function signProfileLink(
    profileLink: ProfileLink,
    signer: (msg: string) => Promise<string>,
): Promise<SignedProfileLink> {
    return {
        profileLink,
        signature: await signer(createProfileLinkMessage(profileLink)),
    };
}

/**
 * signs a ProfileLink
 * @param profileLink the signed ProfileLink object
 * @param verifyer the verifyer function
 */
export async function verifyProfileLink(
    signedProfileLink: SignedProfileLink,
    publicKey?: string,
): Promise<boolean> {
    if (signedProfileLink.profileLink.type === 'ProfileLink' && !publicKey) {
        throw Error('ProfileLink requiers a public key');
    }
    const message = createProfileLinkMessage(signedProfileLink.profileLink);

    return signedProfileLink.profileLink.type === 'ProfileLink'
        ? checkSignature(publicKey!, message, signedProfileLink.signature)
        : ethers.utils.recoverAddress(
              ethers.utils.hashMessage(message),
              signedProfileLink.signature,
          ) === ethers.utils.getAddress(signedProfileLink.profileLink.mainId);
}
