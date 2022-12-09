import { Envelop, MessageMetadata } from './Messaging';
import { getAttachments } from './Attachments';

const metadata: MessageMetadata = {
    to: '',
    from: '',
    timestamp: 1,
    type: 'NEW',
};

test('should accept supported protocols', async () => {
    const envelop: Envelop = {
        message: {
            metadata,
            message: '',
            signature: '',
            attachments: [
                'https://google.de',
                'http://google.de',
                'data:text/plain,test',
            ],
        },
    };
    expect(getAttachments(envelop).map((a) => a.href)).toEqual([
        'https://google.de/',
        'http://google.de/',
        'data:text/plain,test',
    ]);
});

test('should filter unsupported protocols', async () => {
    const envelop: Envelop = {
        message: {
            metadata,
            message: '',
            signature: '',
            attachments: [
                'ftp://google.de',
                'https://google.de',
                'http://google.de',
                'data:text/plain,test',
            ],
        },
    };
    expect(getAttachments(envelop).map((a) => a.href)).toEqual([
        'https://google.de/',
        'http://google.de/',
        'data:text/plain,test',
    ]);
});

test('should filter invalid uris', async () => {
    const envelop: Envelop = {
        message: {
            metadata,
            message: '',
            signature: '',
            attachments: [
                '---',
                'https://google.de',
                'http://google.de',
                'data:text/plain,test',
            ],
        },
    };
    expect(getAttachments(envelop).map((a) => a.href)).toEqual([
        'https://google.de/',
        'http://google.de/',
        'data:text/plain,test',
    ]);
});
