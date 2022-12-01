import Ajv from 'ajv';
import { MutableProfileExtension } from './MutableProfileExtension';
import MutableProfileExtensionSchema from './../schema/MutableProfileExtension.schema.json';
export function validateMutableProfileExtension(
    mutableProfileExtension: MutableProfileExtension,
): boolean {
    const ajv = new Ajv();
    const validate = ajv.compile(MutableProfileExtensionSchema);
    return !!validate(mutableProfileExtension);
}
