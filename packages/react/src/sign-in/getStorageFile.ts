import {
    StorageLocation,
    getDm3Storage,
    googleLoad,
    web3Load,
} from 'dm3-lib-storage';
import { Connection } from '../web3provider/Web3Provider';

export async function getStorageFile(
    storageLocation: StorageLocation,
    web3StorageToken: string,
    deliveryServiceToken: string,
    connection: Connection,
) {
    switch (storageLocation) {
        case StorageLocation.Web3Storage:
            return await web3Load(web3StorageToken as string);

        case StorageLocation.GoogleDrive:
            return await googleLoad((window as any).gapi);

        //Should result in reSignin
        case StorageLocation.dm3Storage:
            return await getDm3Storage(
                connection.provider!,
                connection.account!,
                deliveryServiceToken,
            );

        default:
            throw Error('Unsupported Storage Location');
    }
}
