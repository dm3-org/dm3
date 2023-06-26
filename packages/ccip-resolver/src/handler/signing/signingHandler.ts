import axios from 'axios';

import { signAndEncodeResponse } from './signAndEncodeResponse';
import { ethers } from 'ethers';
import { SigningConfigEntry } from '../../config/Config';

export async function signingHandler(
    calldata: string,
    resolverAddr: string,
    configEntry: SigningConfigEntry,
) {
    const result = (
        await axios.get(`${configEntry.handlerUrl}/${resolverAddr}/${calldata}`)
    ).data;

    const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY as string);

    return signAndEncodeResponse(signer, resolverAddr, result, calldata);
}
