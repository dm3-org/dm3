import { ethers } from 'ethers';

export const sha256 = (msg: string) => {
    const byteArray = ethers.utils.toUtf8Bytes(msg);
    return ethers.utils.sha256(byteArray);
};
