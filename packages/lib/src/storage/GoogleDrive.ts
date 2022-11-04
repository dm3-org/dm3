import { stringify } from '../shared/stringify';
import { UserDB } from '.';
import { Acknoledgment } from '../delivery';
import { log } from '../shared/log';
import { sync, UserStorage } from './Storage';

const FILE_NAME = 'dm3';

async function createGoogleDriveFile(
    gapi: any,
    name: string,
    data: UserStorage,
): Promise<any> {
    const boundary = '-------34253452654745673245345';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const close_delimiter = '\r\n--' + boundary + '--';

    const contentType = 'application/json';

    const metadata = {
        name: name,
        mimeType: contentType,
        parents: ['appDataFolder'],
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        stringify(metadata) +
        delimiter +
        'Content-Type: ' +
        contentType +
        '\r\n\r\n' +
        stringify(data) +
        close_delimiter;

    return gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
    });
}

export async function googleStore(
    gapi: any,
    userDb: UserDB,
): Promise<Acknoledgment[]> {
    if (!gapi) {
        throw Error('No google api object');
    }

    log('Sync with google drive');

    const syncResult = sync(userDb);
    await createGoogleDriveFile(
        gapi,
        FILE_NAME + '-' + new Date().getTime() + '.json',
        syncResult.userStorage,
    );

    return syncResult.acknoledgments;
}

export async function googleLoad(gapi: any): Promise<string | undefined> {
    const files = (
        await (window as any).gapi.client.drive.files.list({
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
            spaces: 'appDataFolder',
            orderBy: 'modifiedTime desc',
        })
    ).result.files;

    log(`Google storage found ${files.length} data files`);

    if (files.length < 1) {
        throw Error('No dm3 data found on google drive');
    }

    files
        .filter((file: { id: string }, index: number) => index > 1)
        .forEach((file: { id: string }) =>
            gapi.client.drive.files
                .delete({
                    fileId: file.id,
                })
                .execute(),
        );

    return stringify(
        (
            await gapi.client.drive.files.get({
                fileId: files[0].id,
                alt: 'media',
            })
        ).result,
    );
}
