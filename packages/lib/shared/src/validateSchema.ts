import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { logError } from './log';

export function validateSchema(schema: any, data: any) {
    let ajv = new Ajv();
    addFormats(ajv);
    try {
        const validate = ajv.compile(schema);
        return validate(data);
    } catch (error) {
        logError({ text: 'validateSchema', error });

        return false;
    }
}
