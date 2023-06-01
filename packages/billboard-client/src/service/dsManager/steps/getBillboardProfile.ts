import { getStorageKeyCreationMessage, createStorageKey } from 'dm3-lib-crypto';
import { createProfileKeys, getUserProfile } from 'dm3-lib-profile';
import { logError, logInfo } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { Billboard } from '../DsManagerImpl';

/**
Retrieves the profiles of billboards.
@param provider - The JSON-RPC provider.
@param billboards - An array of billboards without a profile.
@returns A promise that resolves with an array of billboard profiles.
@throws If there is an error retrieving a billboard profile.
*/
export async function getBillboardProfile(
    provider: ethers.providers.JsonRpcProvider,
    billboards: Billboard[],
) {
    return await Promise.all(
        billboards.map(async (billboard) => {
            logInfo({
                text: 'Get DM3 User Profile',
                billboardEnsName: billboard.ensName,
            });
            const wallet = new ethers.Wallet(billboard.privateKey);
            const storageKeyCreationMessage = getStorageKeyCreationMessage(
                '0xca8f04fdc80d659997f69b02',
            );
            const storageKeySig = await wallet.signMessage(
                storageKeyCreationMessage,
            );
            //We create a storage key for the billboard. This key is used to establish a session with the DS
            const storageKey = await createStorageKey(storageKeySig);
            //TODO Do thoose keys have to match the ones provided with the profile.
            //Shall we throw if that is not the case?
            const profileKeys = await createProfileKeys(storageKey, '0');
            try {
                const billboardProfile = await getUserProfile(
                    provider,
                    billboard.ensName,
                );
                return {
                    ...billboard,
                    ...billboardProfile!,
                    profileKeys,
                    dsProfile: [],
                };
            } catch (error: any) {
                logError({ text: '[getBillboardProfile] ', error });
                throw Error(
                    "Can't get billboard profile for " + billboard.ensName,
                );
            }
        }),
    );
}
