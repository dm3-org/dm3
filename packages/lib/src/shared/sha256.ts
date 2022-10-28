import sjcl from 'sjcl';

export const sha256 = (msg: string) => {
    const hash = sjcl.hash.sha256.hash(msg);
    return sjcl.codec.hex.fromBits(hash);
};
