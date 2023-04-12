import * as Lib from 'dm3-lib';

export async function getStorageFile(
    storageLocation: Lib.storage.StorageLocation,
    web3StorageToken: string,
    deliveryServiceToken: string,
    connection: Lib.Connection,
) {
    switch (storageLocation) {
        case Lib.storage.StorageLocation.Web3Storage:
            return await Lib.storage.web3Load(web3StorageToken as string);

        case Lib.storage.StorageLocation.GoogleDrive:
            return await Lib.storage.googleLoad((window as any).gapi);

        //Should result in reSignin
        case Lib.storage.StorageLocation.dm3Storage:
            return await Lib.storage.getDm3Storage(
                connection.provider!,
                connection.account!,
                deliveryServiceToken,
            );

        default:
            throw Error('Unsupported Storage Location');
    }
}
