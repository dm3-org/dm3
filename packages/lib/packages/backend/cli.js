const lib = require('dm3-lib/dist.backend');

const main = async () => {
    const encryptionKeyPair = await lib.crypto.createKeyPair();
    const signingKeyPair = await lib.crypto.createSigningKeyPair();
    console.log(`\nencryption key pair`);
    console.log(JSON.stringify(encryptionKeyPair, null, 4));
    console.log(`\nsigning key pair`);
    console.log(JSON.stringify(signingKeyPair, null, 4));

    const profile = {
        publicSigningKey: signingKeyPair.publicKey,
        publicEncryptionKey: encryptionKeyPair.publicKey,
        url: process.argv[process.argv.length - 1],
    };
    console.log('\nDelivery service profile');
    console.log(JSON.stringify(profile, null, 4));

    console.log('\nData URI delivery service profile');
    console.log('data:application/json,' + JSON.stringify(profile));
};

main();
