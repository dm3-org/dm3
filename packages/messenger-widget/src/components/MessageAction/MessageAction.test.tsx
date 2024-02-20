import '@testing-library/jest-dom';
describe('MessageAction test cases', () => {
    //TODO fix build problems
});
/* import { fireEvent, render } from '@testing-library/react';
import { MessageAction } from './MessageAction';
import '@testing-library/jest-dom';

describe('MessageAction test cases', () => {
    const ownMsgProps = {
        message: 'Hello DM3',
        time: 'Wed Oct 18 2023 18:39:49 GMT+0530 (India Standard Time)',
        messageState: {} as any,
        ownMessage: true,
        envelop: {
            message: {
                message: 'some data',
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
        reactions: [],
        isLastMessage: false,
    };

    const receivedMsgProps = {
        message: 'Hello DM3',
        time: 'Wed Oct 18 2023 18:39:49 GMT+0530 (India Standard Time)',
        messageState: {} as any,
        ownMessage: false,
        envelop: {
            message: {
                message: 'some data',
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
        reactions: [],
        isLastMessage: false,
    };

    it('Renders MessageAction component for own message', () => {
        const { container } = render(<MessageAction {...ownMsgProps} />);
        const element = container.getElementsByClassName(
            'msg-dropdown-content',
        );
        expect(element).toBeInTheDocument();
    });

    it('Renders MessageAction component for received message', () => {
        const { container } = render(<MessageAction {...receivedMsgProps} />);
        const element = container.getElementsByClassName(
            'msg-dropdown-content',
        );
        expect(element).toBeInTheDocument();
    });

    it('Show edit option for own message', () => {
        const { getByTestId } = render(<MessageAction {...ownMsgProps} />);
        const element = getByTestId('edit-msg');
        expect(element).toBeInTheDocument();
    });

    it('Click on edit option for own message', () => {
        const { getByTestId } = render(<MessageAction {...ownMsgProps} />);
        const element = getByTestId('edit-msg');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Show delete option for own message', () => {
        const { getByTestId } = render(<MessageAction {...ownMsgProps} />);
        const element = getByTestId('delete-msg');
        expect(element).toBeInTheDocument();
    });

    it('Click on delete option for own message', () => {
        const { getByTestId } = render(<MessageAction {...ownMsgProps} />);
        const element = getByTestId('delete-msg');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Show reply option for own message', () => {
        const { getByTestId } = render(<MessageAction {...ownMsgProps} />);
        const element = getByTestId('reply-msg');
        expect(element).toBeInTheDocument();
    });

    it('Click on reply option for own message', () => {
        const { getByTestId } = render(<MessageAction {...ownMsgProps} />);
        const element = getByTestId('reply-msg');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Show reply option for received message', () => {
        const { getByTestId } = render(<MessageAction {...receivedMsgProps} />);
        const element = getByTestId('reply-msg');
        expect(element).toBeInTheDocument();
    });

    it('Click on reply option for received message', () => {
        const { getByTestId } = render(<MessageAction {...receivedMsgProps} />);
        const element = getByTestId('reply-msg');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Click on react to a received message', () => {
        const { getByTestId } = render(<MessageAction {...receivedMsgProps} />);
        const element = getByTestId('reaction-emoji-0');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Show save attachments option for own message', () => {
        const { getByTestId } = render(<MessageAction {...ownMsgProps} />);
        const element = getByTestId('attachments-msg');
        expect(element).toBeInTheDocument();
    });

    it('Click on save attachments option for own message', () => {
        const { getByTestId } = render(<MessageAction {...ownMsgProps} />);
        const element = getByTestId('attachments-msg');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Show save attachments option for received message', () => {
        const { getByTestId } = render(<MessageAction {...receivedMsgProps} />);
        const element = getByTestId('attachments-msg');
        expect(element).toBeInTheDocument();
    });

    it('Click on save attachments option for received message', () => {
        const { getByTestId } = render(<MessageAction {...receivedMsgProps} />);
        const element = getByTestId('attachments-msg');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });
});
 */
