import Ajv from 'ajv';
import { log } from './log';

export function validateSchema(schema: any, data: any) {
    const ajv = new Ajv();
    try {
        const validate = ajv.compile(schema);
        return validate(data);
    } catch (e) {
        log(e as string);
        return false;
    }
}
