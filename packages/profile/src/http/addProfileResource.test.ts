import bodyParser from 'body-parser';
import express from 'express';
import { addProfileResource } from './addProfileResource';
import request from 'supertest';
import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

describe('getProfileResource', () => {
    it('Rejects invalid schema', async () => {
        const app = express();
        app.use(bodyParser.json());
        app.use(addProfileResource());
        const { status, body } = await request(app).post(`/`).send({
            name: 'foo.dm3.eth',
            address: SENDER_ADDRESS,
            signedUserProfile: {},
        });

        expect(status).toBe(400);
        expect(body.error).toBe('invalid schema');
    });
    it('Stores a valid profile', async () => {
        const app = express();
        app.use(bodyParser.json());
        app.use(addProfileResource());

        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const mnemonic =
            'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

        const createUserProfileMessage = Lib.account.getProfileCreationMessage(
            Lib.stringify(profile),
        );
        const signature = await wallet.signMessage(createUserProfileMessage);

        const { status } = await request(app).post(`/`).send({
            name: 'foo.dm3.eth',
            address: SENDER_ADDRESS,
            signedUserProfile: {
                signature,
                profile,
            },
        });

        expect(status).toBe(200);
    });
});
