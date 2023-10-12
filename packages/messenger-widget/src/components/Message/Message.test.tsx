import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
// import { Message } from './Message';
// import _sodium from 'libsodium-wrappers';

describe('Message test cases', () => {
    const props = {
        message: 'Welcome message',
        time: '11 October 2023',
        messageState: jest.mock('') as any,
        ownMessage: true,
        envelop: jest.mock('') as any,
        replyToMsg: undefined,
        replyToMsgFrom: undefined,
        replyToMsgId: undefined,
        reactions: jest.mock('') as any,
        isLastMessage: false,
    };

    it('Renders Message component', async () => {
        // render(<Message {...props} />);
    });
});
