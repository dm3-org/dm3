import { UserDB } from '.';
import { log } from '../shared/log';
import { sync } from './Storage';

const FILE_NAME = 'ensmail';

async function createGoogleDriveFile(
    gapi: any,
    name: string,
    data: any,
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
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' +
        contentType +
        '\r\n\r\n' +
        JSON.stringify(data) +
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

export async function googleStore(gapi: any, userDb: UserDB): Promise<any> {
    if (!gapi) {
        throw Error('No google api object');
    }

    log('Sync with google drive');

    return createGoogleDriveFile(
        gapi,
        FILE_NAME + '-' + new Date().getTime() + '.json',
        sync(userDb),
    );
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

    if (files.length < 1) {
        throw Error('No ENS Mail data found on google drive');
    }

    return JSON.stringify(
        (
            await gapi.client.drive.files.get({
                fileId: files[0].id,
                alt: 'media',
            })
        ).result,
    );
}
