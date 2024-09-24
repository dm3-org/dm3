import {
    getMockDeliveryServiceProfile,
    MockDeliveryServiceProfile,
    MockedUserProfile,
    MockMessageFactory,
    mockUserProfile,
} from '@dm3-org/dm3-lib-test-helper';
import { ethers } from 'ethers';
import { renderMessage } from './renderMessage';

describe('Render Message', () => {
    let sender: MockedUserProfile;
    let receiver: MockedUserProfile;
    let ds1: MockDeliveryServiceProfile;

    beforeEach(async () => {
        sender = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'alice.eth',
            ['ds1.eth'],
        );
        receiver = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'bob.eth',
            ['ds1.eth', 'ds2.eth'],
        );
        ds1 = await getMockDeliveryServiceProfile(
            ethers.Wallet.createRandom(),
            'http://ds1.api',
        );
    });
    describe('edit message', () => {
        it('NEW EDIT', async () => {
            const mockMessageFactory = MockMessageFactory(
                sender,
                receiver,
                ds1,
            );

            const ogMessage = await mockMessageFactory.createMessageModel(
                'Hello Dm3',
                'NEW',
            );

            const editMessage = await mockMessageFactory.createMessageModel(
                'Hello Dm3 Edit',
                'EDIT',
                ogMessage.envelop.metadata?.encryptedMessageHash,
            );

            const messages = [ogMessage, editMessage];

            const res = renderMessage(messages);

            console.log(res[0].envelop);

            expect(res.length).toBe(1);
            expect(res[0].envelop.message.message).toBe('Hello Dm3 Edit');
        });
    });
});
