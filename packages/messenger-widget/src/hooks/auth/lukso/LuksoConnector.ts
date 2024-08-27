import { DEFAULT_NONCE } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { LuksoKeyStore } from './KeyStore/LuksoKeyStore';
import { SmartAccountConnector } from './SmartAccountConnector';
import abiJson from '@erc725/smart-contracts/artifacts/ERC725.json';
import { DM3Configuration } from '../../../widget';

export class LuksoConnector {
    //TODO move to class tailored to lukso
    public static async _instance(
        dm3Configuration: DM3Configuration,
    ): Promise<SmartAccountConnector> {
        //The universal profile extension can be accessed via the window.lukso object
        if (!window.lukso) {
            throw 'Universal Profile extension not found';
        }
        const provider = new ethers.providers.Web3Provider(window.lukso);
        //Connect with the UP extension
        await provider.send('eth_requestAccounts', []);

        //The signer that will be used to sign transactions
        const upController = await provider.getSigner();
        //When uses with UP the signer.getAddress() will return the UP address. Even though the signer uses the controller address to sign transactions
        //TODO clearify with Lukso-Team if that is always the case
        const upAddress = await upController.getAddress();

        //Instance of the UP contract
        const upContract = new ethers.Contract(
            upAddress,
            abiJson.abi,
            upController,
        );

        const keyStore = new LuksoKeyStore(upContract);

        return new SmartAccountConnector(
            keyStore,
            upController,
            dm3Configuration.nonce,
            dm3Configuration.defaultDeliveryService,
        );
    }
}
