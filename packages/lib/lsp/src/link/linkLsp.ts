import axios from 'axios';
import { createEnvelop } from 'dm3-lib-messaging';
import { ProfileKeys } from 'dm3-lib-profile';
import { ethers } from 'ethers';
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
    const msg = await createLinkMessage(
        ownerAddr,
        lspAddr,
        'TBD add message payload',
        lspProfileKeys.signingKeyPair.privateKey,
    );
    const { encryptedEnvelop: envelop, sendDependencies } = await createEnvelop(
        msg,
        web3Provider,
        lspProfileKeys,
        (url: string) => axios.get(url),
    );
    await submitMessage(deliveryServiceUrl, envelop, deliveryServiceToken);
}
