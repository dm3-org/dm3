import { Acknoledgment } from '@dm3-org/dm3-lib-delivery';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { Web3File, Web3Storage } from 'web3.storage';
import { UserDB } from '..';
import { sync } from '../Storage';
import { FILE_NAME_PREFIX, getTimestamp } from '../Utils';

function readFileAsync(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as string);
        };

        reader.onerror = reject;

        reader.readAsText(file);
    });
}

export async function web3Store(
    storageToken: string,
    userDb: UserDB,
    deliveryServiceToken: string,
): Promise<Acknoledgment[]> {
    const syncResult = await sync(userDb, deliveryServiceToken);

    const client = new Web3Storage({ token: storageToken });
    const blob = new Blob([stringify(syncResult.userStorage)], {
        type: 'text/json',
    });

    await client.put([
        new File(
            [blob],
            FILE_NAME_PREFIX + '-' + new Date().getTime() + '.json',
        ),
    ]);

    return syncResult.acknoledgments;
}

export async function web3Load(token: string): Promise<string | undefined> {
    const client = new Web3Storage({ token });
    let newestFile: Web3File | undefined;

    for await (const upload of client.list()) {
        const res = await client.get(upload.cid);
        if (!res?.ok) {
            throw new Error(`failed to get file`);
        }
        const files = await res.files();
        for (const file of files) {
            const timestamp = getTimestamp(file);
            newestFile =
                (timestamp && !newestFile) ||
                (newestFile &&
                    timestamp &&
                    (getTimestamp(newestFile) as number) < timestamp)
                    ? file
                    : newestFile;
        }
    }
    return newestFile ? readFileAsync(newestFile) : undefined;
}
