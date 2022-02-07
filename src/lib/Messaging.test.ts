import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { getMessages } from './Messaging';
import { addContact, ApiConnection } from './Web3Provider';
import {
    connectAccount,
    ConnectionState,
    getAccountDisplayName,
    getSessionToken,
    getWeb3Provider,
} from './Web3Provider';

test('should accept a message with a wrong signature', async () => {
    expect(
        await getMessages(
            { connectionState: ConnectionState.SignedIn },
            '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
            async () => [
                {
                    message:
                        '{"to":"0xbCd6dE065Fd7e889E3ec86AA2D2780D7553AB3cc","from":' +
                        '"0x8101b0729eb9708a344c820fce80f12a90a7c1fa","timestamp":1644250214178,"message":"test"}',
                    signature:
                        '0x14cdd44e79e9072b82ce30fc810badac9ebcd36b60e27b2ed4d3db331' +
                        '6258dc45986221326959cf6c241554359b47918f592791f284ceb418501e54232e37c3d1b',
                },
            ],
        ),
    ).toStrictEqual([
        {
            message:
                '{"to":"0xbCd6dE065Fd7e889E3ec86AA2D2780D7553AB3cc","from":"0x8101b' +
                '0729eb9708a344c820fce80f12a90a7c1fa","timestamp":1644250214178,"message":"test"}',
            signature:
                '0x14cdd44e79e9072b82ce30fc810badac9ebcd36b60e27b2ed4d3db3316258dc4' +
                '5986221326959cf6c241554359b47918f592791f284ceb418501e54232e37c3d1b',
        },
    ]);
});

test('should reject a message with a wrong signature', async () => {
    expect(
        await getMessages(
            { connectionState: ConnectionState.SignedIn },
            '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
            async () => [
                {
                    message:
                        '{"to":"0xbCd6dE065Fd7e889E3ec86AA2D2780D7553AB3cc","from":"0x8101b0729eb97' +
                        '08a344c820fce80f12a90a7c1fa","timestamp":1644250214178,"message":"test"}',
                    signature:
                        '0x14cdd44e79e9072b82ce30fc810badac9ebcd36b60e27b2ed4d3db3316258dc4598622132' +
                        '6959cf6c241554359b47918f592791f284ceb418501e54232e37c3d1c',
                },
            ],
        ),
    ).toStrictEqual([]);
});
