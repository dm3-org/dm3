import Ajv from 'ajv';
import { log } from './log';

export function validateSchema(schema: any, data: any) {
    let ajv = new Ajv();
    try {
        const validate = ajv.compile(schema);
        return validate(data);
    } catch (e) {
        log(e as string, 'error');
        return false;
    }
}
