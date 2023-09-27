import axios from 'axios';
import { createEnvelop } from 'dm3-lib-messaging';
import { ProfileKeys } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { lspLinkAcceptMessage } from '..';
import { submitMessage } from '../api/submitMessage';
import { createLinkAcceptMessage } from './messages/createLinkAcceptMessage';

export async function linkAccept(
    web3Provider: ethers.providers.JsonRpcProvider,
    deliveryServiceUrl: string,
    deliveryServiceToken: string,
    ownerAddr: string,
    lspAddr: string,
    ownerProfileKeys: ProfileKeys,
    linkMessage: string,
    lspEnsName: string,
) {
    const lspLinkSig = await web3Provider.send('personal_sign', [
        lspLinkAcceptMessage(ownerAddr, lspAddr),
        lspAddr,
    ]);
    const msg = await createLinkAcceptMessage(
        lspAddr,
        ownerAddr,
        ownerProfileKeys.signingKeyPair.privateKey,
        linkMessage,
        lspEnsName,
        lspLinkSig,
    );
    const { encryptedEnvelop: envelop, sendDependencies } = await createEnvelop(
        msg,
        web3Provider,
        ownerProfileKeys,
        (url: string) => axios.get(url),
    );
    await submitMessage(deliveryServiceUrl, envelop, deliveryServiceToken);
}
