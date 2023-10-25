import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Message } from './Message';

describe('Message test cases', () => {
    const ownMsgProps = {
        message: 'Hello DM3',
        time: '1697705262',
        messageState: {} as any,
        ownMessage: true,
        envelop: {
            message: {
                message: 'some msg',
                metadata: {
                    to: 'dsajsdsakd',
                    from: 'dsadasddsa',
                    timestamp: 3212312312,
                    referenceMessageHash: 'dsasdass',
                    replyDeliveryInstruction: 'sadas',
                    type: 'NEW' as any,
                },
                attachments: [
                    'https://www.searchenginejournal.com/wp-content/uploads/2019/07/' +
                        'the-essential-guide-to-using-images-legally-online.png',
                ],
                signature: 'sdbsadsa',
            },
            metadata: {
                version: '1.0.0',
                encryptionScheme: 'encrypted',
                deliveryInformation: 'delivered',
                encryptedMessageHash: 'random-hash',
                signature: 'signature',
            },
            postmark: {} as any,
            id: 'uniqui-id',
        },
        replyToMsg: undefined,
        replyToMsgFrom: undefined,
        replyToMsgId: undefined,
        reactions: [
            {
                message: {
                    message: '🙂',
                    metadata: {
                        to: 'dsajsdsakd',
                        from: 'dsadasddsa',
                        timestamp: 3212312312,
                        referenceMessageHash: 'dsasdass',
                        replyDeliveryInstruction: 'sadas',
                        type: 'NEW' as any,
                    },
                    attachments: [
                        'https://www.searchenginejournal.com/wp-content/uploads/2019/07/' +
                            'the-essential-guide-to-using-images-legally-online.png',
                    ],
                    signature: 'sdbsadsa',
                },
                metadata: {
                    version: '1.0.0',
                    encryptionScheme: 'encrypted',
                    deliveryInformation: 'delivered',
                    encryptedMessageHash: 'random-hash',
                    signature: 'signature',
                },
                postmark: {} as any,
                id: 'uniqui-id',
            },
        ],
        isLastMessage: false,
    };

    const receivedMsgProps = {
        message: 'Hello DM3',
        time: '1697705262',
        messageState: {} as any,
        ownMessage: false,
        envelop: {
            message: {
                message: 'received msg',
                metadata: {
                    to: 'dsajsdsakd',
                    from: 'dsadasddsa',
                    timestamp: 3212312312,
                    referenceMessageHash: 'dsasdass',
                    replyDeliveryInstruction: 'sadas',
                    type: 'NEW' as any,
                },
                attachments: [
                    'https://www.searchenginejournal.com/wp-content/uploads/2019/07/' +
                        'the-essential-guide-to-using-images-legally-online.png',
                ],
                signature: 'sdbsadsa',
            },
            metadata: {
                version: '1.0.0',
                encryptionScheme: 'encrypted',
                deliveryInformation: 'delivered',
                encryptedMessageHash: 'random-hash',
                signature: 'signature',
            },
            postmark: {} as any,
            id: 'uniqui-id',
        },
        replyToMsg: undefined,
        replyToMsgFrom: undefined,
        replyToMsgId: undefined,
        reactions: [
            {
                message: {
                    message: '👍',
                    metadata: {
                        to: 'dsajsdsakd',
                        from: 'dsadasddsa',
                        timestamp: 3212312312,
                        referenceMessageHash: 'dsasdass',
                        replyDeliveryInstruction: 'sadas',
                        type: 'NEW' as any,
                    },
                    attachments: [
                        'https://www.searchenginejournal.com/wp-content/uploads/2019/07/' +
                            'the-essential-guide-to-using-images-legally-online.png',
                    ],
                    signature: 'sdbsadsa',
                },
                metadata: {
                    version: '1.0.0',
                    encryptionScheme: 'encrypted',
                    deliveryInformation: 'delivered',
                    encryptedMessageHash: 'random-hash',
                    signature: 'signature',
                },
                postmark: {} as any,
                id: 'uniqui-id',
            },
        ],
        isLastMessage: false,
    };

    it('Renders Message component for own message', async () => {
        const { container } = render(<Message {...ownMsgProps} />);
        const element = container.getElementsByClassName('msg');
        expect(element[0]).toBeInTheDocument();
    });

    it('Renders Message component for received message', async () => {
        const { container } = render(<Message {...receivedMsgProps} />);
        const element = container.getElementsByClassName('msg');
        expect(element[0]).toBeInTheDocument();
    });

    it('Renders own message', async () => {
        const { getByText } = render(<Message {...ownMsgProps} />);
        const element = getByText('some msg');
        expect(element).toBeInTheDocument();
    });

    it('Renders received message', async () => {
        const { getByText } = render(<Message {...receivedMsgProps} />);
        const element = getByText('received msg');
        expect(element).toBeInTheDocument();
    });

    it('Renders own message time', async () => {
        const { getByText } = render(<Message {...ownMsgProps} />);
        const time = new Date(Number(ownMsgProps.time)).toLocaleString();
        const element = getByText(time);
        expect(element).toBeInTheDocument();
    });

    it('Renders received message time', async () => {
        const { getByText } = render(<Message {...receivedMsgProps} />);
        const time = new Date(Number(receivedMsgProps.time)).toLocaleString();
        const element = getByText(time);
        expect(element).toBeInTheDocument();
    });

    it('Renders own message reaction', async () => {
        const { getByText } = render(<Message {...ownMsgProps} />);
        const element = getByText('🙂');
        expect(element).toBeInTheDocument();
    });

    it('Renders received message reaction', async () => {
        const { getByText } = render(<Message {...receivedMsgProps} />);
        const element = getByText('👍');
        expect(element).toBeInTheDocument();
    });
});
