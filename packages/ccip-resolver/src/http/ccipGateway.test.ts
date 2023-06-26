import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import bodyParser from 'body-parser';
import { ethers } from 'ethers';
import express from 'express';
import { ethers as hreEthers, network } from 'hardhat';
import request from 'supertest';
import { OffchainResolver } from '../../typechain';
import MockAdapter from 'axios-mock-adapter';
import { ccipGateway } from './ccipGateway';
import axios from 'axios';

import { config } from 'hardhat';

const { expect } = require('chai');

describe('CCIP Gateway', () => {
    let ccipApp: express.Express;
    let offchainResolver: OffchainResolver;
    let signer: SignerWithAddress;

    beforeEach(async () => {
        //Get signers
        [signer] = await hreEthers.getSigners();

        //Create ResolverContract
        const OffchainResolver = await hreEthers.getContractFactory(
            'OffchainResolver',
        );

        offchainResolver = await OffchainResolver.deploy(
            'http://localhost:8080/{sender}/{data}',
            signer.address,
            [signer.address],
        );

        ccipApp = express();
        ccipApp.use(bodyParser.json());

        ccipApp.locals.logger = {
            // eslint-disable-next-line no-console
            info: (msg: string) => console.log(msg),
            // eslint-disable-next-line no-console
            warn: (msg: string) => console.log(msg),
        };
    });

    it('Returns valid data from resolver', async () => {
        const mock = new MockAdapter(axios);
        const wallet1 = ethers.Wallet.fromMnemonic(
            (config.networks.hardhat.accounts as any).mnemonic,
            (config.networks.hardhat.accounts as any).path + `/${0}`,
        );

        process.env.SIGNER_PRIVATE_KEY = wallet1.privateKey;

        const result = '0x1234';

        const callData = '0x4567';

        mock.onGet(`http://test/${offchainResolver.address}/${callData}`).reply(
            200,
            result,
        );

        const ccipConfig = {};
        ccipConfig[offchainResolver.address] = {
            type: 'signing',
            handlerUrl: 'http://test',
        };

        config[offchainResolver.address] = ccipApp.use(ccipGateway(ccipConfig));

        const sender = offchainResolver.address;

        //You the url returned by he contract to fetch the profile from the ccip gateway
        const response = await request(ccipApp)
            .get(`/${sender}/${callData}`)
            .send();

        expect(response.status).to.equal(200);

        const resultString = await offchainResolver.resolveWithProof(
            response.body.data,
            callData,
        );

        expect(resultString).to.equal(result);
    });
});
