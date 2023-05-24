import { decryptAsymmetric } from 'dm3-lib-crypto';
import { EncryptionEnvelop, Message } from 'dm3-lib-messaging';
import {
    DeliveryServiceProfile,
    ProfileKeys,
    SignedUserProfile,
} from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { IDatabase } from '../../persitance/getDatabase';
import { establishWsConnections } from './steps/establishWsConnection';
import { fetchAndStoreInitialMessages } from './steps/fetchAndStoreInitialMessages';
import { getBillboardProfile } from './steps/getBillboardProfile';
import { getDsProfile } from './steps/getDsProfile';
import { signInAtDs } from './steps/signInAtDs';

export interface Billboard {
    ensName: string;
    privateKey: string;
}

export type BillboardWithProfile = Billboard &
    SignedUserProfile & { profileKeys: ProfileKeys };
export type BillboardWithDsProfile = BillboardWithProfile & {
    dsProfile: DeliveryServiceProfile[];
};
export type AuthenticatedBillboard = BillboardWithDsProfile & {
    dsProfile: (DeliveryServiceProfile & { token: string })[];
};
export type AuthenticatedBillboardWithSocket = AuthenticatedBillboard & {
    dsProfile: (DeliveryServiceProfile & {
        token: string;
        socket: Socket;
    })[];
};

/**
Creates a delivery service connector.
@param db - The database instance.
@param provider - The JSON-RPC provider.
@param billboards - An array of Billboard
@returns An object with connect and disconnect methods.
*/
export function dsManager(
    db: IDatabase,
    provider: ethers.providers.JsonRpcProvider,
    billboards: Billboard[],
    onMessage: (idBillboard: string, message: Message) => Promise<void> = () =>
        Promise.resolve(),
) {
    let _connectedBillboards: AuthenticatedBillboardWithSocket[] = [];

    /**
Initializes the connection to delivery services.
@returns A promise that resolves when the connection initialization is complete.
*/
    async function connect() {
        log('Start to initialize connection to delivery services', 'info');
        //Get all delivery service profiles
        const billboardsWithProfile = await getBillboardProfile(
            provider,
            billboards,
        );

        //Get all delivery service profiles
        const billboardsWithDsProfile = await Promise.all(
            billboardsWithProfile.map(getDsProfile(provider)),
        );
        //For each delivery service profile we've to exercise the login flow
        const authenticatedBillboards = await signInAtDs(
            billboardsWithDsProfile,
        );

        //Fetch initial messages from every DS
        await fetchAndStoreInitialMessages(
            authenticatedBillboards,
            encryptAndStoreMessage(onMessage),
        );

        //For each billboard and their delivryServices we establish a websocket connection
        _connectedBillboards = await establishWsConnections(
            authenticatedBillboards,
            encryptAndStoreMessage(onMessage),
        );
        log('Finished delivery service initialization', 'info');
    }

    /** 
Disconnects all connected billboards by closing their associated sockets.
*/
    function disconnect() {
        _connectedBillboards.forEach((billboard) => {
            billboard.dsProfile.forEach(
                (ds: DeliveryServiceProfile & { socket: Socket }) => {
                    ds.socket.close();
                },
            );
        });
    }

    function getConnectedBillboards() {
        return _connectedBillboards.map(({ ensName }) => ensName);
    }

    /**
Encrypts and stores a message to redis using the provided billboard's keypairs and encryption envelope.
@param billboardWithDsProfile - The billboard with delivery service profile.
@param encryptionEnvelop - The encryption envelope containing the message.
@param broadcastMessage - A callback function that can be used to broadcast the decrypted message i.E a WebSocket.
@returns A promise that resolves when the message has been encrypted and stored.
@throws If there is an error decrypting the message.
*/
    function encryptAndStoreMessage(
        broadcastMessage: (
            idBillboard: string,
            message: Message,
        ) => void = () => {},
    ) {
        return async (
            billboardWithDsProfile: BillboardWithDsProfile,
            encryptionEnvelop: EncryptionEnvelop,
        ) => {
            try {
                const decryptedMessage = JSON.parse(
                    await decryptAsymmetric(
                        billboardWithDsProfile.profileKeys.encryptionKeyPair,
                        JSON.parse(encryptionEnvelop.message),
                    ),
                ) as Message;
                log(
                    'decryptedMessage' + JSON.stringify(decryptedMessage),
                    'debug',
                );
                broadcastMessage(
                    billboardWithDsProfile.ensName,
                    decryptedMessage,
                );
                await db.createMessage(
                    billboardWithDsProfile.ensName,
                    decryptedMessage,
                );
            } catch (err: any) {
                log("Can't decrypt message " + JSON.stringify(err), 'error');
            }
        };
    }

    return { connect, disconnect, getConnectedBillboards };
}
