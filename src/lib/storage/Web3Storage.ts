import { Web3Storage, Web3File } from 'web3.storage';
import { UserDB } from '.';
import { log } from '../shared/log';
import { Connection } from '../web3-provider/Web3Provider';
import { sync } from './Storage';
import { FILE_NAME, getTimestamp } from './Utils';

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

export async function web3Store(connection: Connection, userDb: UserDB) {
    if (!connection.storageToken) {
        throw Error('No API token');
    }

    const client = new Web3Storage({ token: connection.storageToken });
    const blob = new Blob([JSON.stringify(sync(userDb))], {
        type: 'text/json',
    });

    await client.put([
        new File([blob], FILE_NAME + '-' + new Date().getTime() + '.json'),
    ]);
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
