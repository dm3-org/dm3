import { Message } from 'dm3-lib-messaging';
import {
    BillboardProperties,
    IBillboardApiClient,
} from '../IBillboardApiClient';

export function getMockClient(): IBillboardApiClient {
    return new MockClient();
}

class MockClient implements IBillboardApiClient {
    public getMessages(
        idBillboard: string,
        time: number,
        idMessageCursor: string,
    ) {
        const message: Message = {
            message:
                // eslint-disable-next-line max-len
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi consectetur fermentum sapien vel gravida. Nullam feugiat consectetur rhoncus. Cras sagittis eget purus non blandit. Curabitur est massa, egestas non risus eu, ornare rhoncus quam. Phasellus dapibus cursus nisi at elementum.',
            metadata: {
                to: 'billboard.eth',
                from: 'alice.eth',
                timestamp: time,
                referenceMessageHash: '',
                replyDeliveryInstruction: '',
                type: 'NEW',
            },
            signature: '',
        };

        //Random number from 0 to 10
        const numberOfMessages = Math.floor(Math.random() * 10);

        const messages: Message[] = [];
        for (let i = 0; i < numberOfMessages; i++) {
            messages.push(message);
        }

        return Promise.resolve(messages);
    }

    public deleteMessage(
        idBillboard: string,
        idMessage: string,
        mediator: string,
        signature: string,
    ) {
        return Promise.resolve(true);
    }
    public getBillboards() {
        return Promise.resolve(['billboard.eth', 'billboard2.eth']);
    }
    public getBillboardProperties(idBillboard: string) {
        const properties: BillboardProperties = {
            name: 'billboard.eth',
            mediators: ['mediator.eth'],
            time: 123456,
        };

        return Promise.resolve(properties);
    }
    public suspendSender(
        blockedSender: string,
        mediator: string,
        signature: string,
    ) {
        return Promise.resolve(true);
    }

    getActiveViewers(idBillboard: string) {
        return Promise.resolve(12345);
    }
}
