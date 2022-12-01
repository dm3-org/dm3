import { log } from '../../shared/log';
import { GetResource } from '../Account';
import { MutableProfileExtension } from './MutableProfileExtension';
import { validateMutableProfileExtension } from './Validation';

export async function resolveMutableProfileExtension(
    url: string,
    getRessource: GetResource<MutableProfileExtension>,
): Promise<MutableProfileExtension | undefined> {
    const mutableProfileExtension = await getRessource(url);

    if (!mutableProfileExtension) {
        log(
            '[resolveMutableProfileExtension] MutableProfileExtension not found',
        );
        return;
    }

    const isSchemaValid = validateMutableProfileExtension(
        mutableProfileExtension,
    );

    if (!isSchemaValid) {
        log('[resolveMutableProfileExtension] Invalid schema');
        return;
    }

    return mutableProfileExtension;
}
