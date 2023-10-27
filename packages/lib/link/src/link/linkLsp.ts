import axios from 'axios';
import { createEnvelop } from 'dm3-lib-messaging';
import { ProfileKeys } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { lspLinkMessage } from '..';
import { submitMessage } from '../api/submitMessage';
import { createLinkMessage } from './messages/createLinkMessage';

export async function linkLsp(
    web3Provider: ethers.providers.JsonRpcProvider,
    deliveryServiceUrl: string,
    deliveryServiceToken: string,
    ownerAddr: string,
    lspAddr: string,
    lspProfileKeys: ProfileKeys,
) {
    const lspLinkSig = await web3Provider.send('personal_sign', [
        lspLinkMessage(ownerAddr, lspAddr),
        lspAddr,
    ]);
    const msg = await createLinkMessage(
        ownerAddr,
        lspAddr,
        'TBD add message payload',
        lspProfileKeys.signingKeyPair.privateKey,
        lspLinkSig,
    );
    const { encryptedEnvelop: envelop, sendDependencies } = await createEnvelop(
        msg,
        web3Provider,
        lspProfileKeys,
        (url: string) => axios.get(url),
    );
    await submitMessage(deliveryServiceUrl, envelop, deliveryServiceToken);
}
