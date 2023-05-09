import { Message } from 'dm3-lib-messaging';

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomEntry<T>(arr: T[]): T {
    return arr[randomInt(0, arr.length - 1)];
}

function randomTimestamp() {
    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    return new Date(randomInt(threeDaysAgo, now)).getMilliseconds();
}

function loremIpsum(numWords: number) {
    const lorem =
        // eslint-disable-next-line max-len
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

    const words = lorem.split(' ');
    const startIndex = Math.floor(Math.random() * (words.length - numWords));
    const endIndex = startIndex + numWords;
    const result = words.slice(startIndex, endIndex);

    return result.join(' ');
}

export function getRandomMessage(): Message {
    const names = [
        'john.eth',
        'jane.eth',
        'tom.eth',
        'tina.eth',
        'david.eth',
        'debby.eth',
        'mike.eth',
        'michelle.eth',
        'sam.eth',
        'sara.eth',
        'chris.eth',
        'christine.eth',
        'mark.eth',
        'mary.eth',
        'alex.eth',
        'alexa.eth',
        'jason.eth',
        'jessica.eth',
        'eric.eth',
        'erica.eth',
    ];

    return {
        message: loremIpsum(randomInt(10, 30)),
        metadata: {
            to: 'billboard.eth',
            from: randomEntry(names),
            timestamp: randomTimestamp(),
            referenceMessageHash: '',
            replyDeliveryInstruction: '',
            type: 'NEW',
        },
        signature: '',
    };
}
