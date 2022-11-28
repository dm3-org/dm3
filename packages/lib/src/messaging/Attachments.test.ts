import { Envelop } from './Messaging';
import { getAttachments } from './Attachments';

test('should accept supported protocols', async () => {
    const envelop: Envelop = {
        message: {
            to: '',
            from: '',
            message: '',
            signature: '',
            timestamp: 1,
            type: 'NEW',
            attachments: [
                'https://google.de',
                'http://google.de',
                'data:text/plain,test',
            ],
        },
        signature: '',
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
            to: '',
            from: '',
            message: '',
            signature: '',
            timestamp: 1,
            type: 'NEW',
            attachments: [
                'ftp://google.de',
                'https://google.de',
                'http://google.de',
                'data:text/plain,test',
            ],
        },
        signature: '',
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
            to: '',
            from: '',
            message: '',
            signature: '',
            timestamp: 1,
            type: 'NEW',
            attachments: [
                '---',
                'https://google.de',
                'http://google.de',
                'data:text/plain,test',
            ],
        },
        signature: '',
    };
    expect(getAttachments(envelop).map((a) => a.href)).toEqual([
        'https://google.de/',
        'http://google.de/',
        'data:text/plain,test',
    ]);
});
