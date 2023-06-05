import Ajv from 'ajv';
import { logError } from './log';

export function validateSchema(schema: any, data: any) {
    let ajv = new Ajv();
    try {
        const validate = ajv.compile(schema);
        return validate(data);
    } catch (error) {
        logError({ text: 'validateSchema', error });

        return false;
    }
}
