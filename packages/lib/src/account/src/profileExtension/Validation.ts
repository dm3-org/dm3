import Ajv from 'ajv';
import { ProfileExtension } from './ProfileExtension';
import MutableProfileExtensionSchema from '../../schema/ProfileExtension.schema.json';
export function validateMutableProfileExtension(
    mutableProfileExtension: ProfileExtension,
): boolean {
    const ajv = new Ajv();
    const validate = ajv.compile(MutableProfileExtensionSchema);
    return !!validate(mutableProfileExtension);
}
